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
package com.marklogic.hub.deploy.commands;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.ext.modulesloader.Modules;
import com.marklogic.client.ext.modulesloader.ModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.EntityDefModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.MappingDefModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.ext.tokenreplacer.TokenReplacer;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.dataservices.ModelsService;
import com.marklogic.hub.dataservices.StepService;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Date;
import java.util.Iterator;
import java.util.regex.Pattern;

/**
 * Loads user artifacts like mappings and entities. This will be deployed after triggers
 */
@Component
public class LoadUserArtifactsCommand extends AbstractCommand {

    @Autowired
    private HubConfig hubConfig;

    private DocumentPermissionsParser documentPermissionsParser = new DefaultDocumentPermissionsParser();
    private ObjectMapper objectMapper;
    private TokenReplacer tokenReplacer;

    public void setForceLoad(boolean forceLoad) {
        this.forceLoad = forceLoad;
    }

    private boolean forceLoad = false;


    public LoadUserArtifactsCommand() {
        super();
        this.objectMapper = ObjectMapperFactory.getObjectMapper();
        setExecuteSortOrder(LoadHubArtifactsCommand.SORT_ORDER + 1);
    }

    /**
     * For use outside of a Spring container.
     *
     * @param hubConfig
     */
    public LoadUserArtifactsCommand(HubConfig hubConfig) {
        this();
        this.hubConfig = hubConfig;
    }

    boolean isArtifactDir(Path dir, Path startPath) {
        String dirStr = dir.toString();
        String startPathStr = Pattern.quote(startPath.toString());
        String regex = startPathStr + "[/\\\\][^/\\\\]+$";
        return dirStr.matches(regex);
    }

    private PropertiesModuleManager getModulesManager() {
        String timestampFile = hubConfig.getHubProject().getUserModulesDeployTimestampFile();
        PropertiesModuleManager pmm = new PropertiesModuleManager(timestampFile);

        if (forceLoad) {
            pmm.deletePropertiesFile();
        }
        return pmm;
    }

    @Override
    public void execute(CommandContext context) {
        tokenReplacer = context.getAppConfig().buildTokenReplacer();
        loadUserArtifacts();
    }

    /**
     * The CommandContext has no bearing on how user artifacts are loaded, so this method is easier to use when this
     * class is used outside a deployment context.
     */
    public void loadUserArtifacts() {
        HubClient hubClient = hubConfig.newHubClient();

        try {
            long start = System.currentTimeMillis();
            loadModels(hubClient);
            logger.info("Loaded models, time: " + (System.currentTimeMillis() - start) + "ms");

            start = System.currentTimeMillis();
            loadLegacyMappings(hubClient);
            loadFlows(hubClient);
            loadStepDefinitions(hubClient);
            loadSteps(hubClient);
            logger.info("Loaded flows, mappings, step definitions and steps, time: " + (System.currentTimeMillis() - start) + "ms");
        }
        catch (IOException e) {
            throw new RuntimeException("Unable to load user artifacts, cause: " + e.getMessage(), e);
        }
    }

    /**
     * Due to significant performance issues with loading entity models via xdmp.invoke plus the existence of pre and
     * post commit triggers on entity models, separate calls are made to the staging and final app servers for saving
     * entity models. This avoids the performance issue, as the saveModels endpoint will not use an xdmp.invoke to
     * save each model.
     *
     * @param hubClient
     * @throws IOException
     */
    private void loadModels(HubClient hubClient) throws IOException {
        final Path modelsPath = hubConfig.getHubEntitiesDir();
        if (modelsPath.toFile().exists()) {
            ArrayNode modelsArray = objectMapper.createArrayNode();
            EntityDefModulesFinder modulesFinder = new EntityDefModulesFinder();
            Files.walkFileTree(modelsPath, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) {
                    logger.info("Loading models from directory " + dir);
                    modulesFinder.findModules(dir.toString()).getAssets().forEach(r -> {
                        logger.info("Loading model from file: " + r.getFilename());
                        try {
                            modelsArray.add(readArtifact(r.getFile()));
                        }
                        catch (IOException e) {
                            throw new RuntimeException("Unable to read model file: " + r.getFilename() + "; cause: " + e.getMessage(), e);
                        }
                    });
                    return FileVisitResult.CONTINUE;
                }
            });
            if (modelsArray.size() > 0) {
                ModelsService.on(hubClient.getStagingClient()).saveModels(modelsArray);
                ModelsService.on(hubClient.getFinalClient()).saveModels(modelsArray);
            }
        }
    }

    /**
     * "Legacy" = pre-5.3 mappings that are stored in documents outside of flows, but are not mapping steps.
     *
     * @param hubClient
     * @throws IOException
     */
    private void loadLegacyMappings(HubClient hubClient) throws IOException {
        Path mappingsPath = hubConfig.getHubMappingsDir();
        if (mappingsPath.toFile().exists()) {
            JSONDocumentManager finalDocMgr = hubClient.getFinalClient().newJSONDocumentManager();
            JSONDocumentManager stagingDocMgr = hubClient.getStagingClient().newJSONDocumentManager();
            DocumentWriteSet stagingMappingDocumentWriteSet = stagingDocMgr.newWriteSet();
            DocumentWriteSet finalMappingDocumentWriteSet = finalDocMgr.newWriteSet();

            PropertiesModuleManager propertiesModuleManager = getModulesManager();
            ResourceToURI mappingResourceToURI = new ResourceToURI(){
                public String toURI(Resource r) throws IOException {
                    return "/mappings/" + r.getFile().getParentFile().getName() + "/" + r.getFilename();
                }
            };
            MappingDefModulesFinder mappingDefModulesFinder = new MappingDefModulesFinder();
            Files.walkFileTree(mappingsPath, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                    if (isArtifactDir(dir, mappingsPath.toAbsolutePath())) {
                        executeWalk(
                            dir,
                            mappingDefModulesFinder,
                            propertiesModuleManager,
                            mappingResourceToURI,
                            buildMetadata(hubConfig.getMappingPermissions(), "http://marklogic.com/data-hub/mappings"),
                            stagingMappingDocumentWriteSet,
                            finalMappingDocumentWriteSet
                        );
                        return FileVisitResult.CONTINUE;
                    }
                    else {
                        return FileVisitResult.CONTINUE;
                    }
                }
            });

            if (stagingMappingDocumentWriteSet.size() > 0) {
                stagingDocMgr.write(stagingMappingDocumentWriteSet);
                finalDocMgr.write(finalMappingDocumentWriteSet);
            }
        }
    }

    private void executeWalk(
        Path dir,
        ModulesFinder modulesFinder,
        PropertiesModuleManager propertiesModuleManager,
        ResourceToURI resourceToURI,
        DocumentMetadataHandle metadata,
        DocumentWriteSet... writeSets
    ) throws IOException {
        Modules modules = modulesFinder.findModules(dir.toString());
        for (Resource r : modules.getAssets()) {
            addResourceToWriteSets(
                r,
                propertiesModuleManager,
                resourceToURI.toURI(r),
                metadata,
                writeSets
            );
        }
    }

    /**
     * As of 5.2.0, artifact permissions are separate from module permissions. If artifact permissions
     * are not defined, then it falls back to using default permissions.
     *
     * @param permissions
     * @param collection
     * @return
     */
    protected DocumentMetadataHandle buildMetadata(String permissions, String collection) {
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add(collection);
        documentPermissionsParser.parsePermissions(permissions, meta.getPermissions());
        return meta;
    }

    private void addResourceToWriteSets(
        Resource r,
        PropertiesModuleManager propertiesModuleManager,
        String docId,
        DocumentMetadataHandle meta,
        DocumentWriteSet... writeSets
    ) throws IOException {
        if (forceLoad || propertiesModuleManager.hasFileBeenModifiedSinceLastLoaded(r.getFile())) {
            JsonNode json = readArtifact(r.getFile());

            if (json instanceof ObjectNode && json.has("language")) {
                json = replaceLanguageWithLang((ObjectNode)json);
                try {
                    objectMapper.writeValue(r.getFile(), json);
                } catch (Exception ex) {
                    logger.warn("Unable to replace 'language' with 'lang' in artifact file: " + r.getFile().getAbsolutePath()
                        + ". You should replace 'language' with 'lang' yourself in this file. Error cause: " + ex.getMessage(), ex);
                }
            }

            for (DocumentWriteSet writeSet : writeSets) {
                writeSet.add(docId, meta, new JacksonHandle(json));
            }
            propertiesModuleManager.saveLastLoadedTimestamp(r.getFile(), new Date());
        }
    }

    /**
     * Loads steps, where the assumption is that the name of each directory under the steps path corresponds to a step
     * definition type. And thus each .step.json file in that directory should be loaded as a step.
     *
     * @param hubClient
     * @throws IOException
     */
    private void loadSteps(HubClient hubClient) throws IOException {
        final Path stepsPath = hubConfig.getHubProject().getStepsPath();
        if (stepsPath.toFile().exists()) {
            ObjectMapper objectMapper = new ObjectMapper();
            StepService stepService = StepService.on(hubClient.getStagingClient());
            for (File stepTypeDir : stepsPath.toFile().listFiles(File::isDirectory)) {
                final String stepType = stepTypeDir.getName();
                for (File stepFile : stepTypeDir.listFiles((File d, String name) -> name.endsWith(".step.json"))) {
                    JsonNode step = readArtifact(stepFile);
                    if (!step.has("name")) {
                        throw new RuntimeException("Unable to load step from file: " + stepFile + "; no 'name' property found");
                    }
                    final String stepName = step.get("name").asText();
                    logger.info(format("Loading step of type '%s' with name '%s'", stepType, stepName));
                    //We want the contents of file in the project to overwrite the step if it's already present. Hence
                    //steps are deployed with 'overwrite' flag set to true.
                    stepService.saveStep(stepType, step, true);
                }
            }
        }
    }

    private void loadFlows(HubClient hubClient) throws IOException {
        final Path flowsPath = hubConfig.getHubProject().getFlowsDir();
        if (flowsPath.toFile().exists()) {
            ObjectMapper objectMapper = new ObjectMapper();
            ArtifactService service = ArtifactService.on(hubClient.getStagingClient());
            for (File file : flowsPath.toFile().listFiles(f -> f.isFile() && f.getName().endsWith(".flow.json"))) {
                JsonNode flow = readArtifact(file);
                if (!flow.has("name")) {
                    throw new RuntimeException("Unable to load flow from file: " + file + "; no 'name' property found");
                }
                final String flowName = flow.get("name").asText();
                logger.info(format("Loading flow with name '%s'", flowName));
                service.setArtifact("flow", flowName, flow);
            }
        }
    }

    private void loadStepDefinitions(HubClient hubClient) throws IOException {
        final Path stepDefsPath = hubConfig.getHubProject().getStepDefinitionsDir();
        if (stepDefsPath.toFile().exists()) {
            ObjectMapper objectMapper = new ObjectMapper();
            ArtifactService service = ArtifactService.on(hubClient.getStagingClient());
            for (File typeDir : stepDefsPath.toFile().listFiles(File::isDirectory)) {
                final String stepDefType = typeDir.getName();
                for (File defDir : typeDir.listFiles(File::isDirectory)) {
                    final String stepDefName = defDir.getName();
                    File stepDefFile = new File(defDir, stepDefName + ".step.json");
                    if (stepDefFile.exists()) {
                        JsonNode stepDef = readArtifact(stepDefFile);
                        if (!stepDef.has("name")) {
                            throw new RuntimeException("Unable to load step definition from file: " + stepDefFile +
                                "; no 'name' property was found");
                        }
                        logger.info(format("Loading step definition with type '%s' and name '%s'", stepDefType, stepDefName));
                        service.setArtifact("stepDefinition", stepDefName, stepDef);
                    } else {
                        logger.warn(format("Found step definition directory '%s', but did not find expected " +
                            "step definition file: '%s'", defDir.getAbsolutePath(), stepDefFile.getName()));
                    }
                }
            }
        }
    }

    /**
     * Per DHFPROD-3193 and an update to MarkLogic 10.0-2, "lang" must now be used instead of "language". To ensure that
     * a user artifact is never loaded with "language", this command handles both updating the JSON that will be loaded
     * into MarkLogic and updating the artifact file.
     *
     * @param object
     * @return
     */
    protected ObjectNode replaceLanguageWithLang(ObjectNode object) {
        ObjectNode newObject = objectMapper.createObjectNode();
        newObject.put("lang", object.get("language").asText());
        Iterator<String> fieldNames = object.fieldNames();
        while (fieldNames.hasNext()) {
            String fieldName = fieldNames.next();
            if (!"language".equals(fieldName)) {
                newObject.set(fieldName, object.get(fieldName));
            }
        }
        return newObject;
    }

    /**
     * Reads the artifact file, replaces tokens and then returns the content as a JsonNode.
     *
     * @param file
     * @return
     */
    private JsonNode readArtifact(File file) {
        JsonNode jsonNode;
        try {
            String artifact = tokenReplacer.replaceTokens(FileUtils.readFileToString(file));
            jsonNode = objectMapper.readTree(artifact);
        }
        catch (Exception e) {
            throw new RuntimeException("Unable to read file " + file.getName() + " + as JSON; cause: " + e.getMessage(), e);
        }

        return jsonNode;
    }

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    public void setObjectMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    abstract class ResourceToURI {
        public abstract String toURI(Resource r) throws IOException;
    }
}
