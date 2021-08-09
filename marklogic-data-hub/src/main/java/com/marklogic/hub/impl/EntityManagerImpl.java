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
package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.file.PermissionsDocumentFileProcessor;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.ext.modulesloader.impl.AssetFileLoader;
import com.marklogic.client.ext.modulesloader.impl.DefaultModulesLoader;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.ModelsService;
import org.apache.commons.io.FileUtils;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class EntityManagerImpl extends LoggingObject implements EntityManager {

    public static final String ENTITY_FILE_EXTENSION = ".entity.json";

    @Autowired
    private HubConfig hubConfig;

    public EntityManagerImpl() {
    }

    /**
     * For use outside of a Spring container.
     *
     * @param hubConfig
     */
    public EntityManagerImpl(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override
    public boolean saveQueryOptions() {
        QueryOptionsGenerator generator = new QueryOptionsGenerator(hubConfig.newStagingClient());
        try {
            Path dir = hubConfig.getHubProject().getEntityConfigDir();
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }

            File stagingFile = Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile();
            File finalFile = Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile();
            File expStagingFile = Paths.get(dir.toString(), HubConfig.EXP_STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile();
            File expFinalFile = Paths.get(dir.toString(), HubConfig.EXP_FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile();

            List<JsonNode> entities = getAllEntities();
            String options = generator.generateOptions(entities, false);
            if (options != null) {
                FileUtils.writeStringToFile(stagingFile, options);
                logger.info("Wrote entity-specific search options to: " + stagingFile.getAbsolutePath());
                FileUtils.writeStringToFile(finalFile, options);
                logger.info("Wrote entity-specific search options to: " + finalFile.getAbsolutePath());
            }
            String expOptions = generator.generateOptions(entities, true);
            if (expOptions != null) {
                FileUtils.writeStringToFile(expStagingFile, expOptions);
                logger.info("Wrote entity-specific search options for Explorer to: " + stagingFile.getAbsolutePath());
                FileUtils.writeStringToFile(expFinalFile, expOptions);
                logger.info("Wrote entity-specific search options for Explorer to: " + finalFile.getAbsolutePath());
            }
            return true;

        } catch (IOException e) {
            logger.warn("Unable to generate search options, cause: " + e.getMessage(), e);
        }
        return false;
    }

    @Override
    public HashMap<Enum, Boolean> deployQueryOptions() {
        saveQueryOptions();

        HashMap<Enum, Boolean> loadedResources = new HashMap<>();

        if (deployQueryOptions(hubConfig.newFinalClient(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE) &&
            deployQueryOptions(hubConfig.newFinalClient(), HubConfig.EXP_FINAL_ENTITY_QUERY_OPTIONS_FILE)) {
            loadedResources.put(DatabaseKind.FINAL, true);
        }
        if (deployQueryOptions(hubConfig.newStagingClient(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE) &&
            deployQueryOptions(hubConfig.newStagingClient(), HubConfig.EXP_STAGING_ENTITY_QUERY_OPTIONS_FILE)) {
            loadedResources.put(DatabaseKind.STAGING, true);
        }

        return loadedResources;
    }

    private boolean deployQueryOptions(DatabaseClient client, String filename) {
        DefaultModulesLoader modulesLoader = new DefaultModulesLoader(new AssetFileLoader(hubConfig.newFinalClient()));

        boolean isLoaded = false;

        modulesLoader.setModulesManager(null);
        modulesLoader.setShutdownTaskExecutorAfterLoadingModules(false);

        AppConfig appConfig = hubConfig.getAppConfig();
        Path dir = hubConfig.getHubProject().getEntityConfigDir();
        File stagingFile = Paths.get(dir.toString(), filename).toFile();
        if (stagingFile.exists()) {
            modulesLoader.setDatabaseClient(client);
            modulesLoader.getAssetFileLoader().addDocumentFileProcessor(new PermissionsDocumentFileProcessor(appConfig.getModulePermissions()));
            Resource r = modulesLoader.installQueryOptions(new FileSystemResource(stagingFile));
            if (r != null) {
                isLoaded = true;
            }
        }
        modulesLoader.setShutdownTaskExecutorAfterLoadingModules(true);
        modulesLoader.waitForTaskExecutorToFinish();

        return isLoaded;
    }

    @Override
    public boolean saveDbIndexes() {
        try {
            Path dir = hubConfig.getEntityDatabaseDir();
            File finalFile = Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_DATABASE_FILE).toFile();
            File stagingFile = Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_DATABASE_FILE).toFile();
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }

            List<JsonNode> entities = getAllEntities();

            if (entities.size() > 0) {
                DatabaseClient databaseClient = hubConfig.newReverseFlowClient();
                try {
                    DbConfigsManager generator = new DbConfigsManager(databaseClient);
                    ObjectNode indexNode = generator.generateIndexes(entities);

                    // in order to make entity indexes ml-app-deployer compatible, add database-name keys.
                    // ml-app-deployer removes these keys upon sending to marklogic.
                    ObjectMapper mapper = new ObjectMapper();
                    indexNode.put("database-name", "%%mlFinalDbName%%");
                    mapper.writerWithDefaultPrettyPrinter().writeValue(finalFile, indexNode);
                    indexNode.put("database-name", "%%mlStagingDbName%%");
                    mapper.writerWithDefaultPrettyPrinter().writeValue(stagingFile, indexNode);
                    return true;
                } finally {
                    if (databaseClient != null) {
                        databaseClient.release();
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Unable to generate database index files for entity properties; cause: " + e.getMessage(), e);
        }
        return false;
    }

    private List<JsonNode> getAllEntities() {
        List<JsonNode> entities = new ArrayList<>(getAllLegacyEntities());
        Path entitiesPath = hubConfig.getHubEntitiesDir();
        File[] entityDefs = entitiesPath.toFile().listFiles(pathname -> pathname.toString().endsWith(ENTITY_FILE_EXTENSION) && !pathname.isHidden());
        if (entityDefs != null) {
            ObjectMapper objectMapper = new ObjectMapper();
            for (File entityDef : entityDefs) {
                try {
                    FileInputStream fileInputStream = new FileInputStream(entityDef);
                    entities.add(objectMapper.readTree(fileInputStream));
                    fileInputStream.close();
                } catch (IOException e) {
                    logger.warn(format("Ignoring %s entity model as malformed JSON content is found", entityDef.getName()));
                    logger.error(e.getMessage());
                }
            }
        }
        return entities;
    }

    private List<JsonNode> getAllLegacyEntities() {
        List<JsonNode> entities = new ArrayList<>();
        Path entitiesPath = hubConfig.getHubProject().getLegacyHubEntitiesDir();
        File[] entityFiles = entitiesPath.toFile().listFiles(pathname -> pathname.isDirectory() && !pathname.isHidden());
        List<String> entityNames;
        if (entityFiles != null) {
            entityNames = Arrays.stream(entityFiles)
                .map(file -> file.getName())
                .collect(Collectors.toList());

            ObjectMapper objectMapper = new ObjectMapper();
            try {
                for (String entityName : entityNames) {
                    File[] entityDefs = entitiesPath.resolve(entityName).toFile().listFiles((dir, name) -> name.endsWith(ENTITY_FILE_EXTENSION));
                    for (File entityDef : entityDefs) {
                        FileInputStream fileInputStream = new FileInputStream(entityDef);
                        entities.add(objectMapper.readTree(fileInputStream));
                        fileInputStream.close();
                    }
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

        }
        return entities;
    }

    private class QueryOptionsGenerator extends ResourceManager {
        QueryOptionsGenerator(DatabaseClient client) {
            super();
            client.init("mlSearchOptionsGenerator", this);
        }

        String generateOptions(List<JsonNode> entities, boolean forExplorer) {
            try {
                JsonNode node = new ObjectMapper().valueToTree(entities);
                RequestParameters params = new RequestParameters();
                params.put("forExplorer", Boolean.toString(forExplorer));
                return getServices().post(params, new JacksonHandle(node), new StringHandle()).get();
            } catch (Exception e) {
                LoggerFactory.getLogger(getClass()).error("Unable to generate search options based on entity models", e);
                return null;
            }
        }
    }

    @Override
    public boolean savePii() {
        try {
            Path protectedPaths = hubConfig.getUserSecurityDir().resolve("protected-paths");
            Path queryRolesets = hubConfig.getUserSecurityDir().resolve("query-rolesets");
            if (!protectedPaths.toFile().exists()) {
                protectedPaths.toFile().mkdirs();
            }
            if (!queryRolesets.toFile().exists()) {
                queryRolesets.toFile().mkdirs();
            }
            File queryRolesetsConfig = queryRolesets.resolve(HubConfig.PII_QUERY_ROLESET_FILE).toFile();

            ObjectMapper mapper = new ObjectMapper();
            ObjectWriter writer = mapper.writerWithDefaultPrettyPrinter();

            List<JsonNode> entities = getAllEntities();
            if (entities.size() > 0) {
                ArrayNode models = mapper.createArrayNode();
                entities.forEach(model -> models.add(model));
                JsonNode v3ConfigAsJson = ModelsService.on(hubConfig.newStagingClient(null)).generateProtectedPathConfig(models);
                ArrayNode paths = (ArrayNode) v3ConfigAsJson.get("config").get("protected-path");
                int i = 0;
                // write each path as a separate file for ml-gradle
                Iterator<JsonNode> pathsIterator = paths.iterator();
                while (pathsIterator.hasNext()) {
                    JsonNode n = pathsIterator.next();
                    i++;
                    String thisPath = String.format("%02d_%s", i, HubConfig.PII_PROTECTED_PATHS_FILE);
                    File protectedPathConfig = protectedPaths.resolve(thisPath).toFile();
                    writer.writeValue(protectedPathConfig, n);
                }
                writer.writeValue(queryRolesetsConfig, v3ConfigAsJson.get("config").get("query-roleset"));
            }
        } catch (Exception e) {
            logger.error("Unable to generate files for entity properties marked as PII; cause: " + e.getMessage(), e);
            return false;
        }
        return true;
    }
}
