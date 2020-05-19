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

package com.marklogic.hub.flow.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.MappingManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.MappingManagerImpl;
import com.marklogic.hub.mapping.Mapping;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.impl.Step;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;


/**
 * Class for migrating pre-5.3.0 flows to  5.3.0 and above versions
 */

public class FlowMigrator {

    private HubProject hubProject;
    private MappingManager mappingManager;
    private FlowManager flowManager;
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());
    ObjectMapper mapper = new ObjectMapper();

    public FlowMigrator(HubConfig hubConfig){
        hubProject = hubConfig.getHubProject();
        mappingManager = new MappingManagerImpl(hubConfig);
        flowManager = new FlowManagerImpl(hubConfig, mappingManager);
    }

    public void migrateFlows(){
        //Backup flows and mappings
        Path migratedFlows = hubProject.getProjectDir().resolve("migrated-flows");
        try {
            migratedFlows.toFile().mkdirs();
            FileUtils.copyDirectory(hubProject.getFlowsDir().toFile(), migratedFlows.resolve("flows").toFile());
            FileUtils.copyDirectory(hubProject.getHubMappingsDir().toFile(), migratedFlows.resolve("mappings").toFile());
            logger.info("The original flows and mappings are backed up in migrated-flows/flows and migrated-flows/mappings"+
                " directory respectively.");
        } catch (Exception e) {
            throw new RuntimeException("Couldn't migrate flows as backing up flows failed : " + e.getMessage());
        }

        Path stepsDir = hubProject.getProjectDir().resolve("steps");
        Path ingestionDir = stepsDir.resolve(StepDefinition.StepDefinitionType.INGESTION.toString());
        Path mappingDir = stepsDir.resolve(StepDefinition.StepDefinitionType.MAPPING.toString());

        try {
            ingestionDir.toFile().mkdirs();
            mappingDir.toFile().mkdirs();
        } catch (Exception e) {
            throw new RuntimeException("Couldn't migrate flows as creation of step artifact directories  failed : " + e.getMessage());
        }

        ObjectWriter writer = mapper.writerWithDefaultPrettyPrinter();
        JsonNodeFactory nodeFactory = mapper.getNodeFactory();

        flowManager.getLocalFlows().forEach(flow ->{
            Map<String, Step> steps = flow.getSteps();
            boolean flowRequiresMigration = flowRequiresMigration(flow);
            logger.info(flowRequiresMigration(flow) ? "Migrating flow " + flow.getName() :
                "Flow " + flow.getName() + " contains no ingestion or mapping step. It doesn't require migration");
            if(flowRequiresMigration){
                ObjectNode newFlow = nodeFactory.objectNode();
                newFlow.put("name", flow.getName());
                ObjectNode newSteps = nodeFactory.objectNode();;
                for (Map.Entry<String, Step> entry : steps.entrySet()) {
                    Step step = entry.getValue();
                    if(stepRequiresMigration(step)){
                        String stepId = String.join("-", step.getName(), step.getStepDefinitionType().toString());
                        newSteps.set(entry.getKey(),
                            nodeFactory.objectNode().put("stepId",stepId));
                        ObjectNode newStepArtifact = createStepArtifact(flow, step);
                        Path targetDir = step.getStepDefinitionType().equals(StepDefinition.StepDefinitionType.INGESTION) ? ingestionDir : mappingDir;
                        String stepFileName = new StringBuilder(step.getName()).append(".step.json").toString();
                        File stepFile = targetDir.resolve(stepFileName).toFile();
                        logger.info("Creating step artifact "+ stepFile.toString());
                        if (stepFile.exists()) {
                            String msg = "Step artifact " + stepFile.toString() + " already exists. The step artifact will be written to ";
                            //Update step artifact with new name
                            String stepName = new StringBuilder(flow.getName()).append("-").append(step.getName()).toString();
                            newStepArtifact.put("name", stepName);
                            //Update the filename
                            stepFileName = new StringBuilder(flow.getName()).append("-").append(stepFileName).toString();
                            stepFile = targetDir.resolve(stepFileName).toFile();
                            logger.info(msg + stepFile.toString()) ;
                            stepId = String.join("-", flow.getName(), stepId);
                            //Update the pointer in the flow
                            ((ObjectNode)newSteps.get(entry.getKey())).put("stepId", stepId);
                        }
                        //'stepId' should be included in every step
                        newStepArtifact.put("stepId", stepId);
                        try{
                            writer.writeValue(stepFile, newStepArtifact);
                            logger.info("Step artifact " + stepFile.toString() + " successfully created.");
                        }
                        catch(IOException e){
                            logger.error("Step artifact " + stepFile.toString() + " creation failed: " + e.getMessage());
                        }
                    }
                    else {
                        logger.info("Step " + step.getName() + " is not an out of the box ingestion or mapping step. It will remain inline inside the flow artifact");
                        newSteps.set(entry.getKey(), mapper.valueToTree(step));
                    }
                }
                newFlow.set("steps",newSteps);
                File flowFile = Paths.get(hubProject.getFlowsDir().toString(), flow.getName() + FlowManager.FLOW_FILE_EXTENSION).toFile();
                try{
                    writer.writeValue(flowFile, newFlow);
                    logger.info("Flow " + flowFile.toString() + " successfully migrated.");
                }
                catch(IOException e){
                    logger.error("Flow artifact " + flowFile.toString() + " creation failed: " + e.getMessage());
                }
            }
        });
        //Finally remove the 'mappings' directory
        try{
            FileUtils.deleteDirectory(hubProject.getHubMappingsDir().toFile());
            logger.info("Removing 'mappings' directory from the project as it is no longer needed");
        }
        catch(IOException e){
            logger.error("Removing 'mappings' directory from the project failed");
        }
    }

    // Only create step artifacts for ootb ingestion and mapping steps. Other steps(including custom ingestion and mapping)
    // will be inline
    protected boolean stepRequiresMigration(Step step) {
        return (StepDefinition.StepDefinitionType.MAPPING.equals(step.getStepDefinitionType()) && "entity-services-mapping".equalsIgnoreCase(step.getStepDefinitionName())) ||
            (StepDefinition.StepDefinitionType.INGESTION.equals(step.getStepDefinitionType()) &&  "default-ingestion".equalsIgnoreCase(step.getStepDefinitionName()));
    }

    protected boolean flowRequiresMigration(Flow flow){
        return flow.getSteps().values().stream().anyMatch(step -> stepRequiresMigration(step));
    }

    private ObjectNode createStepArtifact(Flow flow, Step step) {
        JsonNode options = mapper.valueToTree(step.getOptions());
        ObjectNode newStepArtifact = mapper.valueToTree(step);

        if(StepDefinition.StepDefinitionType.MAPPING.equals(step.getStepDefinitionType())){
            JsonNode mappingNode = (JsonNode) step.getOptions().get("mapping");
            String mappingName = mappingNode.get("name").asText();
            String mappingVersion = mappingNode.get("version").asText();
            try{
                Mapping mapping = mappingManager.getMapping(mappingName, Integer.valueOf(mappingVersion), false);
                newStepArtifact.put("targetEntityType", mapping.getTargetEntityType());
                newStepArtifact.set("properties", mapper.valueToTree(mapping.getProperties()));
                if(mapping.getNamespaces() != null){
                    newStepArtifact.set("namespaces", mapper.valueToTree(mapping.getNamespaces()));
                }
                newStepArtifact.put("selectedSource", "collection");
            }
            catch (DataHubProjectException e){
                logger.error("Mapping '" + mappingName + "' with version " + mappingVersion + " is not found. The mapping properties will" +
                    " not be written into the step artifact " + step.getName() + " which is part of the flow " + flow.getName() );
            }
        }
        else{
            JsonNode fileLocations = step.getFileLocations();
            fileLocations.fields().forEachRemaining(field -> newStepArtifact.set(field.getKey(), field.getValue()));
            newStepArtifact.remove("fileLocations");
            newStepArtifact.put("sourceFormat", newStepArtifact.get("inputFileType") != null ? newStepArtifact.get("inputFileType").asText() : "json");
            newStepArtifact.remove("inputFileType");
        }
        newStepArtifact.remove("options");

        Set<String> fieldsNotToBeCopied = Set.of("mapping");

        options.fields().forEachRemaining(kv -> {
            if(!fieldsNotToBeCopied.contains(kv.getKey())){
                newStepArtifact.set(kv.getKey(), kv.getValue());
            }
        });

        newStepArtifact.put("targetFormat", newStepArtifact.get("outputFormat") != null ? newStepArtifact.get("outputFormat").asText() : "json");
        newStepArtifact.remove("outputFormat");

        return newStepArtifact;
    }
}
