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
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.ext.modulesloader.Modules;
import com.marklogic.client.ext.modulesloader.ModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.BaseModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.EntityDefModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.MappingDefModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.ArtifactManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.artifact.ArtifactTypeInfo;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.dataservices.ModelsService;
import com.marklogic.hub.dataservices.StepService;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
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
        loadUserArtifacts();
    }

    /**
     * The CommandContext has no bearing on how user artifacts are loaded, so this method is easier to use when this
     * class is used outside a deployment context.
     */
    public void loadUserArtifacts() {
        DatabaseClient stagingClient = hubConfig.newStagingClient(null);

        try {
            // Models are loaded via their own DS endpoint
            loadModels(stagingClient);

            // Supports pre-5.3 mappings
            loadMappingsViaRestApi(stagingClient);

            ArtifactService artifactService = ArtifactService.on(stagingClient);

            // TODO Can simplify this to just having a method for flows and a method for step definitions once
            // we're no longer creating matching settings
            ArtifactManager artifactManager = ArtifactManager.on(hubConfig.newHubClient());
            for (ArtifactTypeInfo typeInfo: artifactManager.getArtifactTypeInfoList()) {
                final String artifactType = typeInfo.getType();
                if ("ingestion".equals(artifactType) || "mapping".equals(artifactType) || "custom".equals(artifactType)) {
                    continue;
                }
                final Path artifactPath = hubConfig.getHubProject().getArtifactTypePath(typeInfo);
                if (!artifactPath.toFile().exists()) {
                    logger.debug("Artifact directory '"+ artifactPath + "' does not exist, so will not load any artifacts from it." );
                    continue;
                }
                if (!typeInfo.getUserCanUpdate()) {
                    logger.warn("User is not permitted to update artifacts of type '" + artifactType+ "', so will not " +
                        "load any artifacts of that type from directory " + artifactPath);
                    continue;
                }
                logger.info("Loading artifacts of type '" + artifactType + "' from directory " + artifactPath);
                final String fileExtension = "*" + typeInfo.getFileExtension();
                BaseModulesFinder modulesFinder = new BaseModulesFinder(){
                    @Override
                    protected Modules findModulesWithResolvedBaseDir(String resolvedBaseDir) {
                        Modules modules = new Modules();
                        /* First write settings and then the artifact to prevent creation of default artifacts
                         */
                        modules.setAssets(findResources(artifactType + " Artifact", resolvedBaseDir, fileExtension));
                        return modules;
                    }
                };
                /*  All artifacts are present in base dir except stepdef, hence run File.walk
                    also we shouldn't attempt to reload the previously loaded mappings(using REST) using DS.
                 */
                if("stepDefinition".equals(artifactType)){
                    Files.walkFileTree(artifactPath, new SimpleFileVisitor<Path>() {
                        @Override
                        public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                            if (dir.toFile().isDirectory()) {
                                loadArtifactsWithDataService(dir, modulesFinder, artifactService, typeInfo);
                            }
                            return FileVisitResult.CONTINUE;
                        }
                    });
                }
                else {
                    loadArtifactsWithDataService(artifactPath, modulesFinder, artifactService, typeInfo);
                }
            }

            // Then load steps
            loadSteps(stagingClient);
        }
        catch (IOException e) {
            throw new RuntimeException("Unable to load user artifacts, cause: " + e.getMessage(), e);
        }
    }

    protected void loadModels(DatabaseClient stagingClient) throws IOException {
        final Path modelsPath = hubConfig.getHubEntitiesDir();
        if (modelsPath.toFile().exists()) {
            ModelsService modelsService = ModelsService.on(stagingClient);
            EntityDefModulesFinder modulesFinder = new EntityDefModulesFinder();
            Files.walkFileTree(modelsPath, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                    logger.info("Loading models from directory " + dir);
                    modulesFinder.findModules(dir.toString()).getAssets().forEach(r -> {
                        JsonNode model;
                        try {
                            model = objectMapper.readTree(r.getInputStream());
                        } catch (IOException e) {
                            throw new RuntimeException("Unable to read model as JSON; model filename: " + r.getFilename(), e);
                        }
                        modelsService.saveModel(model);
                        logger.info("Loaded model from file " + r.getFilename());
                    });
                    return FileVisitResult.CONTINUE;
                }
            });
        }
    }

    /**
     * TODO The ArtifactService isn't loading all mappings the way that this method does, so we still need it in place
     * for mappings created prior to 5.3.0.
     *
     * @param stagingClient
     * @throws IOException
     */
    protected void loadMappingsViaRestApi(DatabaseClient stagingClient) throws IOException {
        Path mappingsPath = hubConfig.getHubMappingsDir();
        if (mappingsPath.toFile().exists()) {
            DatabaseClient finalClient = hubConfig.newFinalClient();
            JSONDocumentManager finalDocMgr = finalClient.newJSONDocumentManager();
            JSONDocumentManager stagingDocMgr = stagingClient.newJSONDocumentManager();
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

    private void loadArtifactsWithDataService(
        Path dir,
        ModulesFinder modulesFinder,
        ArtifactService artifactService,
        ArtifactTypeInfo artifactTypeInfo
    ) throws IOException {
        Modules modules = modulesFinder.findModules(dir.toString());
        for (Resource r : modules.getAssets()) {
            JsonNode artifactJson = objectMapper.readTree(r.getFile());
            artifactService.setArtifact(
                artifactTypeInfo.getType(),
                artifactJson.get(artifactTypeInfo.getNameProperty()).asText(),
                artifactJson
            );
            logger.info(String.format("Loaded artifact of type type '%s' file %s", artifactTypeInfo.getType(), r.getFilename()));
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
            InputStream inputStream = r.getInputStream();

            JsonNode json;
            try {
                json = objectMapper.readTree(inputStream);
            } finally {
                inputStream.close();
            }

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
     * @param stagingClient
     * @throws IOException
     */
    private void loadSteps(DatabaseClient stagingClient) throws IOException {
        final Path stepsPath = hubConfig.getHubProject().getStepsPath();
        if (stepsPath.toFile().exists()) {
            ObjectMapper objectMapper = new ObjectMapper();
            StepService stepService = StepService.on(stagingClient);
            for (File stepTypeDir : stepsPath.toFile().listFiles(file -> file.isDirectory())) {
                final String stepType = stepTypeDir.getName();
                for (File stepFile : stepTypeDir.listFiles((File d, String name) -> name.endsWith(".step.json"))) {
                    JsonNode step = objectMapper.readTree(stepFile);
                    if (!step.has("name")) {
                        throw new RuntimeException("Unable to load step from file: " + stepFile + "; no 'name' property found");
                    }
                    final String stepName = step.get("name").asText();
                    if (logger.isInfoEnabled()) {
                        logger.info(format("Loading step of type '%s' with name '%s'", stepType, stepName));
                    }
                    stepService.saveStep(stepType, step);
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
