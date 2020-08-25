/*
 * Copyright (c) 2020 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.marklogic.hub.hubcentral.conversion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.DeleteListener;
import com.marklogic.client.datamovement.QueryBatcher;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.*;
import com.marklogic.hub.dataservices.MasteringService;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.MappingManagerImpl;
import com.marklogic.hub.impl.StepManager;
import com.marklogic.hub.mapping.Mapping;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.StepDefinition.StepDefinitionType;
import org.apache.commons.io.FileUtils;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;


/**
 * Class for converting pre-5.3.0 artifacts to 5.3.0 and above versions
 */
public class FlowConverter extends LoggingObject {

    private MappingManager mappingManager;
    private FlowManager flowManager;
    private StepManager stepManager;
    private HubConfig hubConfig;
    private ObjectMapper mapper = new ObjectMapper();

    public FlowConverter(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.mappingManager = new MappingManagerImpl(hubConfig);
        this.flowManager = new FlowManagerImpl(hubConfig, mappingManager);
        this.stepManager = new StepManager(hubConfig);
    }

    /**
     * After flows have been converted, a user needs to delete any legacy mappings that exist, as these have now been
     * converted to mapping steps. Fortunately, a delete trigger exists on these to also delete the xml/xslt documents
     * associated with them.
     */
    public void deleteLegacyMappings() {
        logger.info("Deleting legacy mappings in staging and final databases");
        HubClient hubClient = hubConfig.newHubClient();
        Stream.of(hubClient.getStagingClient(), hubClient.getFinalClient()).forEach(client -> {
            DataMovementManager dmm = client.newDataMovementManager();
            QueryManager queryManager = client.newQueryManager();
            StructuredQueryBuilder queryBuilder = queryManager.newStructuredQueryBuilder();
            StructuredQueryDefinition query = queryBuilder.andNot(
                queryBuilder.collection("http://marklogic.com/data-hub/mappings"),
                queryBuilder.collection("http://marklogic.com/data-hub/steps")
            );
            QueryBatcher queryBatcher = dmm.newQueryBatcher(query)
                .withConsistentSnapshot()
                .withThreadCount(4) // If not set, DMSDK logs an unattractive warning
                .onUrisReady(new DeleteListener());
            dmm.startJob(queryBatcher);
            queryBatcher.awaitCompletion();
            dmm.stopJob(queryBatcher);
        });
    }

    /**
     * Convert the flow files in a user's local project. Does not make any changes to what's stored in MarkLogic.
     */
    public void convertFlows() {
        HubProject hubProject = hubConfig.getHubProject();
        final File flowsDir = hubProject.getFlowsDir().toFile();
        if (!flowsDir.exists()) {
            logger.warn("No flows directory exists, so no flows will be converted");
            return;
        }

        logger.warn("Beginning conversion of flows");

        //Backup flows and mappings
        Path convertedFlowsPath = hubProject.getProjectDir().resolve("converted-flows");
        try {
            convertedFlowsPath.toFile().mkdirs();
            FileUtils.copyDirectory(flowsDir, convertedFlowsPath.resolve("flows").toFile());
            File mappingsDir = hubProject.getHubMappingsDir().toFile();
            if (mappingsDir.exists()) {
                FileUtils.copyDirectory(mappingsDir, convertedFlowsPath.resolve("mappings").toFile());
            }
        }
        catch (Exception e) {
            throw new RuntimeException("Couldn't convert flows as backing up flows failed : " + e.getMessage(), e);
        }
        Path ingestionDir = hubProject.getStepsPath(StepDefinitionType.INGESTION);
        Path mappingDir = hubProject.getStepsPath(StepDefinitionType.MAPPING);
        Path matchingDir = hubProject.getStepsPath(StepDefinitionType.MATCHING);
        Path mergingDir = hubProject.getStepsPath(StepDefinitionType.MERGING);
        Path masteringDir = hubProject.getStepsPath(StepDefinitionType.MASTERING);
        Path customStepDir = hubProject.getStepsPath(StepDefinitionType.CUSTOM);

        try {
            ingestionDir.toFile().mkdirs();
            mappingDir.toFile().mkdirs();
            matchingDir.toFile().mkdirs();
            mergingDir.toFile().mkdirs();
            masteringDir.toFile().mkdirs();
            customStepDir.toFile().mkdirs();
        } catch (Exception e) {
            throw new RuntimeException("Couldn't convert flows as creation of step artifact directories failed : " + e.getMessage(), e);
        }

        ObjectWriter writer = mapper.writerWithDefaultPrettyPrinter();
        JsonNodeFactory nodeFactory = mapper.getNodeFactory();

        for (ObjectNode flowNode : flowManager.getLocalFlowsAsJSON()) {
            String flowName = flowNode.get("name").asText();
            logger.warn(format("Converting flow '%s'", flowName));

            ObjectNode stepsNode = (ObjectNode) flowNode.get("steps");
            Iterator<Map.Entry<String, JsonNode>> entryIterator =  stepsNode.fields();
            while (entryIterator.hasNext()) {
                Map.Entry<String, JsonNode> entry = entryIterator.next();
                ObjectNode stepNode = (ObjectNode) entry.getValue();

                // Look for stepId, indicating a previously converted step.
                if (stepNode.has("stepId")) {
                    String stepId = stepNode.get("stepId").asText();
                    String stepDefTypeStr = stepId.substring(stepId.lastIndexOf("-") + 1).toLowerCase();
                    StepDefinition.StepDefinitionType stepDefType = StepDefinition.StepDefinitionType.getStepDefinitionType(stepDefTypeStr);

                    // Need to convert match steps to new model, if they have not been already
                    if (stepDefType.equals(StepDefinitionType.MATCHING) && !stepNode.has("matchRulesets")) {
                        ObjectNode refStepNode = stepManager.getLocalStepAsJSON(stepId);
                        transformMatchingOptions(refStepNode);
                        stepManager.saveLocalStep(refStepNode);
                        int i = 0;
                    }
                    // Need to convert merge steps to new model, if they have not been already
                    else if (stepDefType.equals(StepDefinitionType.MERGING) && !stepNode.has("mergeRules")) {
                        ObjectNode refStepNode = stepManager.getLocalStepAsJSON(stepId);
                        transformMergingOptions(refStepNode);
                        stepManager.saveLocalStep(refStepNode);
                        int i = 0;
                    }
                    continue;
                }

                String stepId;
                Path targetDir;
                String stepName = getStepName(stepNode);
                StepDefinition.StepDefinitionType stepDefType = StepDefinition.StepDefinitionType.getStepDefinitionType(stepNode.get("stepDefinitionType").asText());

                if (StepDefinitionType.INGESTION.equals(stepDefType)) {
                    targetDir = ingestionDir;
                    stepId = String.join("-", stepName, StepDefinitionType.INGESTION.toString());
                }
                else if (StepDefinitionType.MATCHING.equals(stepDefType)) {
                    targetDir = matchingDir;
                    stepId = String.join("-", stepName, StepDefinitionType.MATCHING.toString());
                }
                else if (StepDefinitionType.MERGING.equals(stepDefType)){
                    targetDir = mergingDir;
                    stepId = String.join("-", stepName, StepDefinitionType.MERGING.toString());
                }
                else if (StepDefinitionType.MASTERING.equals(stepDefType)) {
                    if ("default-mastering".equalsIgnoreCase(stepNode.get("stepDefinitionName").asText())) {
                        targetDir = masteringDir;
                        stepId = String.join("-", stepName, StepDefinitionType.MASTERING.toString());
                    }
                    else {
                        logger.warn(format("The mastering step '%s' will be converted to a custom step (step with " +
                            "step definition type 'custom').", stepName));
                        targetDir = customStepDir;
                        stepId = String.join("-", stepName, StepDefinitionType.CUSTOM.toString());
                        // Change step definition type to "custom" for custom mapping step without a valid mapping
                        stepNode.put("stepDefinitionType", StepDefinitionType.CUSTOM.toString());
                    }
                }
                else if (StepDefinitionType.MAPPING.equals(stepDefType)) {
                    if ("entity-services-mapping".equalsIgnoreCase(stepNode.get("stepDefinitionName").asText()) ||
                        getMappingArtifact(flowName, stepNode) != null)
                    {
                        targetDir = mappingDir;
                        stepId = String.join("-", stepName, StepDefinitionType.MAPPING.toString());
                    }
                    else {
                        logger.warn(format("The custom mapping step '%s' will be converted to a custom step (step with " +
                            "step definition type 'custom') as a valid mapping can't be found.", stepName));
                        targetDir = customStepDir;
                        stepId = String.join("-", stepName, StepDefinitionType.CUSTOM.toString());
                        // Change step definition type to "custom" for custom mapping step without a valid mapping
                        stepNode.put("stepDefinitionType", StepDefinitionType.CUSTOM.toString());
                    }
                }
                else {
                    targetDir = customStepDir;
                    stepId = String.join("-", stepName, StepDefinitionType.CUSTOM.toString());
                    if (! StepDefinitionType.CUSTOM.equals(stepDefType)) {
                        logger.warn(format("The custom mastering step '%s' will be converted to a custom step (step with " +
                            "step definition type 'custom')", stepName));
                    }
                    // Change step definition type to "custom" for all other step types(custom mastering, custom steps)
                    stepNode.put("stepDefinitionType", StepDefinitionType.CUSTOM.toString());
                }
                ObjectNode newStepArtifact = createStepArtifact(flowName, stepNode);
                stepsNode.set(entry.getKey(), nodeFactory.objectNode().put("stepId", stepId));

                String stepFileName = stepName + ".step.json";
                File stepFile = targetDir.resolve(stepFileName).toFile();
                logger.info(format("Creating step artifact '%s'", stepFile.toString()));
                if (stepFile.exists()) {
                    String msg = "Step artifact '" + stepFile.toString() + "' already exists. The step artifact will be written to ";
                    // Update step artifact with new name
                    stepName = flowName + "-" + stepName;
                    newStepArtifact.put("name", stepName);
                    // Update the filename
                    stepFileName = flowName + "-" + stepFileName;
                    stepFile = targetDir.resolve(stepFileName).toFile();
                    logger.warn(msg + stepFile.toString());
                    stepId = flowName + "-" + stepId;
                    // Update the stepId in the flow
                    stepsNode.set(entry.getKey(), nodeFactory.objectNode().put("stepId", stepId));
                }
                // 'stepId' should be included in every step
                newStepArtifact.put("stepId", stepId);

                // convert matching step to 5.4 model
                if (stepDefType.equals(StepDefinitionType.MATCHING)) {
                    transformMatchingOptions(newStepArtifact);
                }
                // convert merging step to 5.4 model
                else if (stepDefType.equals(StepDefinitionType.MERGING)) {
                    transformMergingOptions(newStepArtifact);
                }

                try {
                    writer.writeValue(stepFile, newStepArtifact);
                    logger.warn(format("Step artifact '%s' successfully created", stepFile));
                } catch (IOException e) {
                    logger.error(format("Step artifact '%s' creation failed; cause: %s.", stepFile, e.getMessage(), e));
                }
            }
            File flowFile = Paths.get(hubProject.getFlowsDir().toString(), flowName + FlowManager.FLOW_FILE_EXTENSION).toFile();
            try {
                writer.writeValue(flowFile, flowNode);
                logger.warn(format("Flow '%s' was successfully converted", flowFile));
            } catch (IOException e) {
                logger.error(format("Flow '%s' conversion failed; cause: %s", flowFile, e.getMessage()), e);
            }
        }

        logger.warn("The original flows and mappings have been backed up to the converted-flows/flows and converted-flows/mappings directories respectively");
        if (hubProject.getHubMappingsDir().toFile().exists()) {
            try {
                logger.warn("Removing 'mappings' directory from the project as it is no longer needed");
                FileUtils.deleteDirectory(hubProject.getHubMappingsDir().toFile());
            } catch (IOException e) {
                logger.error("Removing 'mappings' directory from the project failed; cause: " + e, e);
            }
        }
        logger.warn("");
        logger.warn("Finished converting flows.");
        logger.warn("Please examine the converted flow and step artifact to verify their contents, particularly the collections of each step.");
        logger.warn("The conversion process ensures that steps have their step name as a collection, and that a mapping (and custom if entity name is present) step has its entity name as a collection.");
    }

    protected String getStepName(ObjectNode stepNode) {
        String stepName;
        if (stepNode.has("name")) {
            stepName = stepNode.get("name").asText();
        }
        else {
            stepName = StepDefinition.StepDefinitionType.getStepDefinitionType(stepNode.get("stepDefinitionType").asText()).toString();
        }
        return stepName;
    }

    protected Mapping getMappingArtifact(String flowName, JsonNode inlineStep) {
        Mapping mapping = null;
        JsonNode mappingNode = (JsonNode) inlineStep.get("options").get("mapping");
        if (mappingNode != null) {
            if (!mappingNode.has("name")) {
                logger.warn(format("Unable to convert mapping in flow '%s' because it does not have a 'name' property"));
            }
            else {
                String mappingName = mappingNode.get("name").asText();
                int version = 0;
                if (mappingNode.has("version")) {
                    String versionText = mappingNode.get("version").asText();
                    try {
                        version = Integer.parseInt(versionText);
                    }
                    catch (Exception ex) {
                        logger.warn(format("Unable to parse version '%s' from step '%s' in flow '%s'; will use zero as the version instead",
                            versionText, inlineStep.get("name").asText(), flowName));
                    }
                }
                try {
                    mapping = mappingManager.getMapping(mappingName, version, false);
                }
                catch (DataHubProjectException e) {
                    logger.warn(format("Mapping '%s' with version '%s' was not found; the mapping properties will not be written to the " +
                        "step artifact named '%s' which was extracted from flow '%s'", mappingName, version, inlineStep.get("name").asText(), flowName));
                }
            }
        }
        return mapping;
    }

    protected ObjectNode createStepArtifact(String flowName, JsonNode inlineStep) {
        Mapping mapping = null;
        //Obtain mapping for any step whose 'stepDefinitionType' is 'mapping'
        if (stepDefTypeEqual(StepDefinitionType.MAPPING, inlineStep.get("stepDefinitionType"))) {
            mapping = getMappingArtifact(flowName, inlineStep);
        }
        return buildStepArtifact(inlineStep, mapping, flowName);
    }

    /**
     * Extracted for easy unit testing; has no dependencies on anything other than the inputs.
     *
     * @param inlineStep
     * @param mapping
     * @param flowName
     * @return
     */
    protected ObjectNode buildStepArtifact(JsonNode inlineStep, Mapping mapping, String flowName) {
        ObjectNode stepArtifact = inlineStep.deepCopy();

        // Convert all options to top-level properties in the step
        stepArtifact.remove("options");
        JsonNode options = inlineStep.get("options");
        if (options != null) {
            Set<String> fieldsNotToBeCopied = Set.of("mapping", "sourceCollection");
            //Don't remove any properties from 'options' for custom steps and convert them as is
            options.fields().forEachRemaining(kv -> {
                if (!fieldsNotToBeCopied.contains(kv.getKey()) || inlineStep.get("stepDefinitionType").asText().equals(StepDefinitionType.CUSTOM.toString())) {
                    JsonNode value = kv.getValue();
                    if (value != null) {
                        stepArtifact.set(kv.getKey(), value);
                    }
                }
            });
        }

        // Convert outputFormat->targetFormat
        stepArtifact.put("targetFormat", stepArtifact.get("outputFormat") != null ? stepArtifact.get("outputFormat").asText() : "json");
        stepArtifact.remove("outputFormat");

        // Remove customHook if module isn't set
        if (stepArtifact.has("customHook")) {
            JsonNode hook = stepArtifact.get("customHook");
            boolean removeHook = false;
            if (!hook.has("module")) {
                removeHook = true;
            }
            if (hook.has("module") && StringUtils.isEmpty(hook.get("module").asText().trim())) {
                removeHook = true;
            }
            if (removeHook) {
                stepArtifact.remove("customHook");
            }
        }

        // Remove retryLimit, as it has no impact and is thus confusing
        stepArtifact.remove("retryLimit");

        // Convert fileLocations for ingestion steps
        JsonNode fileLocations = inlineStep.get("fileLocations");
        if (fileLocations != null) {
            fileLocations.fields().forEachRemaining(field -> stepArtifact.set(field.getKey(), field.getValue()));
            stepArtifact.remove("fileLocations");
            stepArtifact.put("sourceFormat", stepArtifact.get("inputFileType") != null ? stepArtifact.get("inputFileType").asText() : "json");
            stepArtifact.remove("inputFileType");
        }

        // Convert stuff from the separate mapping artifact if it exists
        if (mapping != null) {
            stepArtifact.put("targetEntityType", mapping.getTargetEntityType());
            stepArtifact.set("properties", mapper.valueToTree(mapping.getProperties()));
            if (mapping.getNamespaces() != null) {
                stepArtifact.set("namespaces", mapper.valueToTree(mapping.getNamespaces()));
            }
            stepArtifact.put("selectedSource", "query");
        }

        // Convert and/or get rid of targetEntity for a mapping step
        if ((stepDefTypeEqual(StepDefinitionType.MAPPING, inlineStep.get("stepDefinitionType")) ||
            stepDefTypeEqual(StepDefinitionType.CUSTOM, inlineStep.get("stepDefinitionType"))) &&
            stepArtifact.has("targetEntity"))
        {
            if (!stepArtifact.has("targetEntityType")) {
                stepArtifact.put("targetEntityType", stepArtifact.get("targetEntity").asText());
            }
            stepArtifact.remove("targetEntity");
        }

        Stream.of("batchSize", "threadCount").forEach(prop -> {
            if (stepArtifact.has(prop) && "0".equals(stepArtifact.get(prop).asText())) {
                stepArtifact.remove(prop);
            }
        });

        addToCollections(stepArtifact, inlineStep, flowName);

        return stepArtifact;
    }

    private boolean stepDefTypeEqual(StepDefinitionType type, JsonNode node) {
        if (node == null)
            return false;

        return node.asText().equalsIgnoreCase(type.toString());
    }

    /**
     * For any step, ensure that the stepName is in the collections array. For a mapping step, also include the
     * value of targetEntityType.
     *
     * @param stepArtifact
     * @param inlineStep
     * @param flowName
     */
    protected void addToCollections(ObjectNode stepArtifact, JsonNode inlineStep, String flowName) {
        ArrayNode collections;
        if (stepArtifact.has("collections")) {
            JsonNode node = stepArtifact.get("collections");
            if (node instanceof ArrayNode) {
                collections = (ArrayNode) node;
            } else {
                collections = mapper.createArrayNode();
                collections.add(node.asText());
            }
        } else {
            collections = mapper.createArrayNode();
        }

        final String stepName = inlineStep.get("name").asText();
        final String targetEntityName = stepArtifact.has("targetEntityType") ? getEntityNameFromEntityType(stepArtifact.get("targetEntityType").asText()) : null;

        boolean stepNameExists = false;
        boolean targetEntityNameExists = false;
        Iterator<JsonNode> arrayItems = collections.elements();
        while (arrayItems.hasNext()) {
            String collection = arrayItems.next().asText();
            if (stepName.equals(collection)) {
                stepNameExists = true;
            }
            if (targetEntityName != null && targetEntityName.equals(collection)) {
                targetEntityNameExists = true;
            }
        }
        if (!stepNameExists) {
            logger.warn(format("Adding step name as a collection to step '%s' in flow '%s'", stepName, flowName));
            collections.add(stepName);
        }
        if (targetEntityName != null && !targetEntityNameExists) {
            logger.warn(format("Adding entity name '%s' as a collection to step '%s' in flow '%s'", targetEntityName, stepName, flowName));
            collections.add(targetEntityName);
        }

        stepArtifact.set("collections", collections);
    }

    /**
     * To avoid making flow conversion depend on connecting to ML, we're implementing a simple approach here to try to
     * extract the entity name that should work most of the time. Since the user will be instructed to inspect the
     * mapping collections after the flow conversion is performed, we assume that the user will verify that the
     * collections are correct after the conversion is completed.
     *
     * @param targetEntityType
     * @return
     */
    protected String getEntityNameFromEntityType(String targetEntityType) {
        int index = targetEntityType.lastIndexOf("/");
        return index > -1 ? targetEntityType.substring(index + 1) : targetEntityType;
    }

    protected void transformMatchingOptions(ObjectNode stepNode) {
        JsonNode beforeNode = stepNode.get("matchOptions");
        // if matchOptions is null, this conversion has already run
        if (beforeNode == null) {
            return;
        }

        JsonNode afterNode = MasteringService.on(hubConfig.newHubClient().getStagingClient()).updateMatchOptions(beforeNode);
        stepNode.remove("matchOptions");

        // copy new keys into step (matchRulesets, thresholds, etc.)
        Iterator<String> fieldNames = afterNode.fieldNames();
        while (fieldNames.hasNext()) {
            String fieldName = fieldNames.next();
            JsonNode node = afterNode.get(fieldName);
            stepNode.set(fieldName, node);
        }
    }

    protected void transformMergingOptions(ObjectNode stepNode) {
        JsonNode beforeNode = stepNode.get("mergeOptions");
        // if mergeOptions is null, this conversion has already run
        if (beforeNode == null) {
            return;
        }

        JsonNode afterNode = MasteringService.on(hubConfig.newHubClient().getStagingClient()).updateMergeOptions(beforeNode);
        stepNode.remove("mergeOptions");

        // copy new keys into step (mergeStrategies, mergeRulesets, etc.)
        Iterator<String> fieldNames = afterNode.fieldNames();
        while (fieldNames.hasNext()) {
            String fieldName = fieldNames.next();
            JsonNode node = afterNode.get(fieldName);
            stepNode.set(fieldName, node);
        }
    }
}
