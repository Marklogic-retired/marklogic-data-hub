/*
 * Copyright (c) 2021 MarkLogic Corporation
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
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.ext.modulesloader.Modules;
import com.marklogic.client.ext.modulesloader.ModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.EntityDefModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.MappingDefModulesFinder;
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
import com.marklogic.mgmt.resource.hosts.HostManager;
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
     * Load the models into MarkLogic and assure that the expanded tree cache is cleared to ensure old schema isn't cached.
     *
     * @param hubClient
     * @throws IOException
     */
    private void loadModels(HubClient hubClient) throws IOException {
        final File modelsDir = hubConfig.getHubEntitiesDir().toFile();
        EntityDefModulesFinder modulesFinder = new EntityDefModulesFinder();
        logger.info("Loading models from directory " + modelsDir);
        ArrayNode modelsArray = objectMapper.createArrayNode();
        modulesFinder.findModules(modelsDir.toString()).getAssets().forEach(r -> {
            try {
                logger.info("Loading model from file: " + r.getFilename());
                modelsArray.add(readArtifact(r.getFile()));
            }
            catch (IOException e) {
                throw new RuntimeException("Unable to read model file: " + r.getFilename() + "; cause: " + e.getMessage(), e);
            }
        });
        if (modelsArray.size() > 0) {
            ModelsService.on(hubClient.getStagingClient()).saveModels(modelsArray);
            clearExpandedTreeCache(hubClient);
        }
    }

    /**
     * Attempts to clear the expanded tree cache for each node in the cluster.
     *
     * @param hubClient
     */
    private void clearExpandedTreeCache(HubClient hubClient) {
        AppConfig mlAppConfig = hubConfig.getAppConfig();
        String originalHost = mlAppConfig.getHost();
        try {
            new HostManager(hubClient.getManageClient()).getHostNames().forEach((host) -> {
                mlAppConfig.setHost(host);
                logger.info("Clearing expanded tree cache on host: " + host);
                mlAppConfig.newAppServicesDatabaseClient("Documents").newServerEval().xquery("xdmp:expanded-tree-cache-clear()").evalAs(String.class);
            });
        } catch (Exception e) {
            logger.info("Failed to clear expanded tree cache: " + e.getMessage());
        } finally {
            mlAppConfig.setHost(originalHost);
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
        ResourceToURI resourceToURI,
        DocumentMetadataHandle metadata,
        DocumentWriteSet... writeSets
    ) throws IOException {
        Modules modules = modulesFinder.findModules(dir.toString());
        for (Resource r : modules.getAssets()) {
            addResourceToWriteSets(
                r,
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
        String docId,
        DocumentMetadataHandle meta,
        DocumentWriteSet... writeSets
    ) throws IOException {
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
    }

    /**
     * Loads steps, where the assumption is that the name of each directory under the steps path corresponds to a step
     * definition type. And thus each .step.json file in that directory should be loaded as a step.
     *
     * @param hubClient
     * @throws IOException
     */
    private void loadSteps(HubClient hubClient) {
        final Path stepsPath = hubConfig.getHubProject().getStepsPath();
        if (stepsPath.toFile().exists()) {
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
                    //steps are deployed with 'overwrite' flag set to true and 'throwErrorIfStepIsPresent' set to false.
                    stepService.saveStep(stepType, step, true, false);
                }
            }
        }
    }

    private void loadFlows(HubClient hubClient) {
        final Path flowsPath = hubConfig.getHubProject().getFlowsDir();
        if (flowsPath.toFile().exists()) {
            ArtifactService service = ArtifactService.on(hubClient.getStagingClient());
            for (File file : flowsPath.toFile().listFiles(f -> f.isFile() && f.getName().endsWith(".flow.json"))) {
                JsonNode flow = readArtifact(file);
                if (!flow.has("name")) {
                    throw new RuntimeException("Unable to load flow from file: " + file + "; no 'name' property found");
                }
                final String flowName = flow.get("name").asText();
                logger.info(format("Loading flow with name '%s'", flowName));
                service.setArtifact("flow", flowName, flow, "");
            }
        }
    }

    private void loadStepDefinitions(HubClient hubClient) {
        final Path stepDefsPath = hubConfig.getHubProject().getStepDefinitionsDir();
        if (stepDefsPath.toFile().exists()) {
            ArtifactService service = ArtifactService.on(hubClient.getStagingClient());
            for (File typeDir : stepDefsPath.toFile().listFiles(File::isDirectory)) {
                final String stepDefType = typeDir.getName();
                for (File defDir : typeDir.listFiles(File::isDirectory)) {
                    String[] fileNames;
                    fileNames = defDir.list();
                    for (String stepDefFileName : fileNames) {
                        File stepDefFile = new File(defDir, stepDefFileName);
                        if (stepDefFile.exists()) {
                            JsonNode stepDef = readArtifact(stepDefFile);
                            if (!stepDef.has("name")) {
                                throw new RuntimeException("Unable to load step definition from file: " + stepDefFile +
                                    "; no 'name' property was found");
                            }
                            final String stepDefName = stepDef.get("name").asText();
                            logger.info(format("Loading step definition with type '%s' and name '%s'", stepDefType, stepDefName));
                            service.setArtifact("stepDefinition", stepDefName, stepDef, stepDefFileName.replace(".step.json",""));
                        } else {
                            logger.warn(format("Found step definition directory '%s', but did not find expected " +
                                "step definition file: '%s'", defDir.getAbsolutePath(), stepDefFile.getName()));
                        }
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
