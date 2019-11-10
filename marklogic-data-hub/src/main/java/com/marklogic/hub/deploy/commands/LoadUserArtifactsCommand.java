/*
 * Copyright 2012-2019 MarkLogic Corporation
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
import com.marklogic.client.ext.modulesloader.impl.*;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.HubConfig;
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
        setExecuteSortOrder(SortOrderConstants.DEPLOY_TRIGGERS + 1);
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

            // Need to delete ml-javaclient-utils timestamp file as well as modules present in the standard gradle locations are now
            // loaded by the modules loader in the parent class which adds these entries to the ml-javaclient-utils timestamp file
            String filePath = hubConfig.getAppConfig().getModuleTimestampsPath();
            if (filePath != null) {
                File defaultTimestampFile = new File(filePath);
                if (defaultTimestampFile.exists()) {
                    defaultTimestampFile.delete();
                }
            }
        }
        return pmm;
    }

    @Override
    public void execute(CommandContext context) {
        DatabaseClient stagingClient = hubConfig.newStagingClient();
        DatabaseClient finalClient = hubConfig.newFinalClient();

        Path entitiesPath = hubConfig.getHubEntitiesDir();
        Path mappingsPath = hubConfig.getHubMappingsDir();
        Path stepDefPath = hubConfig.getStepDefinitionsDir();
        Path flowPath = hubConfig.getFlowsDir();

        JSONDocumentManager finalDocMgr = finalClient.newJSONDocumentManager();
        JSONDocumentManager stagingDocMgr = stagingClient.newJSONDocumentManager();

        DocumentWriteSet finalEntityDocumentWriteSet = finalDocMgr.newWriteSet();
        DocumentWriteSet stagingEntityDocumentWriteSet = stagingDocMgr.newWriteSet();
        DocumentWriteSet stagingMappingDocumentWriteSet = stagingDocMgr.newWriteSet();
        DocumentWriteSet finalMappingDocumentWriteSet = finalDocMgr.newWriteSet();
        DocumentWriteSet stagingStepDefDocumentWriteSet = stagingDocMgr.newWriteSet();
        DocumentWriteSet finalStepDefDocumentWriteSet = finalDocMgr.newWriteSet();
        DocumentWriteSet stagingFlowDocumentWriteSet = stagingDocMgr.newWriteSet();
        DocumentWriteSet finalFlowDocumentWriteSet = finalDocMgr.newWriteSet();
        PropertiesModuleManager propertiesModuleManager = getModulesManager();
        ResourceToURI entityResourceToURI = new ResourceToURI(){
            public String toURI(Resource r) {
                return "/entities/" + r.getFilename();
            }
        };
        ResourceToURI mappingResourceToURI = new ResourceToURI(){
            public String toURI(Resource r) throws IOException {
                return "/mappings/" + r.getFile().getParentFile().getName() + "/" + r.getFilename();
            }
        };
        ResourceToURI flowResourceToURI = new ResourceToURI(){
            public String toURI(Resource r) {
                return "/flows/" + r.getFilename();
            }
        };
        ResourceToURI stepResourceToURI = new ResourceToURI(){
            public String toURI(Resource r) throws IOException {
                return "/step-definitions/" + r.getFile().getParentFile().getParentFile().getName() + "/" + r.getFile().getParentFile().getName() + "/" + r.getFilename();
            }
        };
        EntityDefModulesFinder entityDefModulesFinder = new EntityDefModulesFinder();
        MappingDefModulesFinder mappingDefModulesFinder = new MappingDefModulesFinder();
        StepDefModulesFinder stepDefModulesFinder = new StepDefModulesFinder();
        FlowDefModulesFinder flowDefModulesFinder = new FlowDefModulesFinder();
        try {
            //first let's do the entities paths
            if (entitiesPath.toFile().exists()) {
                Files.walkFileTree(entitiesPath, new SimpleFileVisitor<Path>() {
                    @Override
                    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                        executeWalk(
                            dir,
                            entityDefModulesFinder,
                            propertiesModuleManager,
                            entityResourceToURI,
                            buildMetadataForEntityModels(hubConfig),
                            stagingEntityDocumentWriteSet,
                            finalEntityDocumentWriteSet
                        );
                        return FileVisitResult.CONTINUE;
                    }
                });
            }
            //now let's do the mappings paths
            if (mappingsPath.toFile().exists()) {
                Files.walkFileTree(mappingsPath, new SimpleFileVisitor<Path>() {
                    @Override
                    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                        if (isArtifactDir(dir, mappingsPath.toAbsolutePath())) {
                            executeWalk(
                                dir,
                                mappingDefModulesFinder,
                                propertiesModuleManager,
                                mappingResourceToURI,
                                buildMetadata("http://marklogic.com/data-hub/mappings", hubConfig.getModulePermissions()),
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
            }

            // let's do step-definitions
            if (stepDefPath.toFile().exists()) {
                Files.walkFileTree(stepDefPath, new SimpleFileVisitor<Path>() {
                    @Override
                    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                        executeWalk(
                            dir,
                            stepDefModulesFinder,
                            propertiesModuleManager,
                            stepResourceToURI,
                            buildMetadata("http://marklogic.com/data-hub/step-definition", hubConfig.getModulePermissions()),
                            stagingStepDefDocumentWriteSet,
                            finalStepDefDocumentWriteSet
                        );
                        return FileVisitResult.CONTINUE;
                    }
                });
            }


            // let's do flows
            if (flowPath.toFile().exists()) {
                Files.walkFileTree(flowPath, new SimpleFileVisitor<Path>() {
                    @Override
                    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                        executeWalk(
                            dir,
                            flowDefModulesFinder,
                            propertiesModuleManager,
                            flowResourceToURI,
                            buildMetadata("http://marklogic.com/data-hub/flow", hubConfig.getModulePermissions()),
                            stagingFlowDocumentWriteSet,
                            finalFlowDocumentWriteSet
                        );
                        return FileVisitResult.CONTINUE;
                    }
                });
            }

            if (stagingEntityDocumentWriteSet.size() > 0) {
                finalDocMgr.write(finalEntityDocumentWriteSet);
                stagingDocMgr.write(stagingEntityDocumentWriteSet);
            }
            if (stagingMappingDocumentWriteSet.size() > 0) {
                stagingDocMgr.write(stagingMappingDocumentWriteSet);
                finalDocMgr.write(finalMappingDocumentWriteSet);
            }
            if (stagingStepDefDocumentWriteSet.size() > 0) {
                stagingDocMgr.write(stagingStepDefDocumentWriteSet);
                finalDocMgr.write(finalStepDefDocumentWriteSet);
            }
            if (stagingFlowDocumentWriteSet.size() > 0) {
                stagingDocMgr.write(stagingFlowDocumentWriteSet);
                finalDocMgr.write(finalFlowDocumentWriteSet);
            }

        }
        catch (IOException e) {
            e.printStackTrace();
            //throw new RuntimeException(e);
        }
    }

    /**
     * As of 5.1.0, entity model permissions are separate from module permissions. Though if entity model permissions
     * are not defined, then this falls back to using module permissions.
     *
     * @param config
     * @return
     */
    protected DocumentMetadataHandle buildMetadataForEntityModels(HubConfig config) {
        String permissions = config.getEntityModelPermissions();
        if (permissions == null || permissions.trim().length() < 1) {
            if (logger.isInfoEnabled()) {
                logger.info("Entity model permissions were not set, so using module permissions; consider setting mlEntityModelPermissions " +
                    "in case you want entity models to have custom permissions.");
            }
            permissions = config.getModulePermissions();
        }
        return buildMetadata("http://marklogic.com/entity-services/models", permissions);
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

    private DocumentMetadataHandle buildMetadata(String collection, String permissions) {
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
