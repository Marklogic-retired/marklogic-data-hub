/*
 * Copyright 2012-2018 MarkLogic Corporation
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
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.ext.modulesloader.impl.AssetFileLoader;
import com.marklogic.client.ext.modulesloader.impl.DefaultModulesLoader;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.EntityServicesGenerationException;
import com.marklogic.hub.util.HubModuleManager;
import org.apache.commons.io.FileUtils;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

public class EntityManagerImpl extends LoggingObject implements EntityManager {
    private static final String ENTITY_FILE_EXTENSION = ".entity.json";

    private HubConfig hubConfig;
    private ObjectMapper mapper;

    public EntityManagerImpl(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        mapper = new ObjectMapper();
    }

    @Override public boolean saveQueryOptions() {
        QueryOptionsGenerator generator = new QueryOptionsGenerator(hubConfig.newStagingClient());
        try {
            Path dir = Paths.get(hubConfig.getProjectDir(), HubConfig.ENTITY_CONFIG_DIR);
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }

            File stagingFile = Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile();
            File finalFile = Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile();

            long lastModified = Math.max(stagingFile.lastModified(), finalFile.lastModified());
            List<JsonNode> entities = getModifiedRawEntities(lastModified);
            if (entities.size() > 0) {
                String options = generator.generateOptions(entities);
                FileUtils.writeStringToFile(stagingFile, options);
                FileUtils.writeStringToFile(finalFile, options);
                return true;
            }
        }
        catch(IOException e) {
            e.printStackTrace();
        }
        return false;
    }

    @Override public HashMap<Enum, Boolean> deployQueryOptions() {
        // save them first
        saveQueryOptions();

        HashMap<Enum, Boolean> loadedResources = new HashMap<>();
        if (deployFinalQueryOptions()) loadedResources.put(DatabaseKind.FINAL, true);
        if (deployStagingQueryOptions()) loadedResources.put(DatabaseKind.STAGING, true);
        return loadedResources;
    }


    public boolean deployFinalQueryOptions() {
        return deployQueryOptions(hubConfig.newFinalClient(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE);
    }
    public boolean deployStagingQueryOptions() {
        return deployQueryOptions(hubConfig.newStagingClient(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE);
    }

    private boolean deployQueryOptions(DatabaseClient client, String filename) {

        HubModuleManager propsManager = getPropsMgr();
        DefaultModulesLoader modulesLoader = new DefaultModulesLoader(new AssetFileLoader(hubConfig.newFinalClient(), propsManager));

        boolean isLoaded = false;

        modulesLoader.setModulesManager(propsManager);
        modulesLoader.setShutdownTaskExecutorAfterLoadingModules(false);

        Path dir = Paths.get(hubConfig.getProjectDir(), HubConfig.ENTITY_CONFIG_DIR);
        File stagingFile = Paths.get(dir.toString(), filename).toFile();
        if (stagingFile.exists()) {
            modulesLoader.setDatabaseClient(client);
            Resource r = modulesLoader.installQueryOptions(new FileSystemResource(stagingFile));
            if (r != null) {
                isLoaded = true;
            }
        }
        modulesLoader.setShutdownTaskExecutorAfterLoadingModules(true);
        modulesLoader.waitForTaskExecutorToFinish();

        return isLoaded;
    }

    @Override public boolean saveDbIndexes() {
        try {
            Path dir = hubConfig.getEntityDatabaseDir();
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }
            File finalFile = Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_DATABASE_FILE).toFile();
            File stagingFile = Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_DATABASE_FILE).toFile();

            long lastModified = Math.max(finalFile.lastModified(), stagingFile.lastModified());
            List<JsonNode> entities = getModifiedRawEntities(lastModified);
            if (entities.size() > 0) {
                DbIndexGenerator generator = new DbIndexGenerator(hubConfig.newReverseFlowClient());
                String indexes = generator.getIndexes(entities);

                // in order to make entity indexes ml-app-deployer compatible, add database-name keys.
                // ml-app-deployer removes these keys upon sending to marklogic.
                ObjectNode indexNode = (ObjectNode) mapper.readTree(indexes);
                indexNode.put("database-name", "%%mlFinalDbName%%");
                mapper.writerWithDefaultPrettyPrinter().writeValue(finalFile, indexNode);
                indexNode.put("database-name", "%%mlStagingDbName%%");
                mapper.writerWithDefaultPrettyPrinter().writeValue(stagingFile, indexNode);
                return true;
            }
        }
        catch(IOException e) {
            e.printStackTrace();
        }
        return false;
    }


    private HubModuleManager getPropsMgr() {
        String timestampFile = hubConfig.getUserModulesDeployTimestampFile();
        HubModuleManager propertiesModuleManager = new HubModuleManager(timestampFile);
        return propertiesModuleManager;
    }

    private List<JsonNode> getAllEntities() {
        List<JsonNode> entities = new ArrayList<>();
        Path entitiesPath = hubConfig.getHubEntitiesDir();
        File[] entityFiles = entitiesPath.toFile().listFiles(pathname -> pathname.isDirectory() && !pathname.isHidden());
        List<String> entityNames;
        if (entityFiles != null) {
            entityNames = Arrays.stream(entityFiles)
                .map(file -> file.getName())
                .collect(Collectors.toList());

            ObjectMapper objectMapper = new ObjectMapper();
            try {
                boolean hasOneChanged = false;
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

    private List<JsonNode> getModifiedRawEntities(long minimumFileTimestampToLoad) {
        logger.debug("min modified: " + minimumFileTimestampToLoad);
        HubModuleManager propsManager = getPropsMgr();
        propsManager.setMinimumFileTimestampToLoad(minimumFileTimestampToLoad);

        List<JsonNode> entities = new ArrayList<>();
        List<JsonNode> tempEntities = new ArrayList<>();
        Path entitiesPath = hubConfig.getHubEntitiesDir();
        File[] entityFiles = entitiesPath.toFile().listFiles(pathname -> pathname.isDirectory() && !pathname.isHidden());
        List<String> entityNames;
        if (entityFiles != null) {
            entityNames = Arrays.stream(entityFiles)
                .map(file -> file.getName())
                .collect(Collectors.toList());

            ObjectMapper objectMapper = new ObjectMapper();
            try {
                boolean hasOneChanged = false;
                for (String entityName : entityNames) {
                    File[] entityDefs = entitiesPath.resolve(entityName).toFile().listFiles((dir, name) -> name.endsWith(ENTITY_FILE_EXTENSION));
                    for (File entityDef : entityDefs) {
                        if (propsManager.hasFileBeenModifiedSinceLastLoaded(entityDef)) {
                            hasOneChanged = true;
                        }
                        FileInputStream fileInputStream = new FileInputStream(entityDef);
                        tempEntities.add(objectMapper.readTree(fileInputStream));
                        fileInputStream.close();
                    }
                }
                // all or nothing
                if (hasOneChanged) {
                    entities.addAll(tempEntities);
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

        }
        return entities;
    }

    private class PiiGenerator extends ResourceManager {
        private static final String NAME = "ml:piiGenerator";
        private RequestParameters params = new RequestParameters();

        PiiGenerator(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        public String piiGenerate(List<JsonNode> entities) {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode node = objectMapper.valueToTree(entities);
            ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, new JacksonHandle(node));
            if (resultItr == null || ! resultItr.hasNext()) {
                throw new EntityServicesGenerationException("Unable to generate pii config");
            }
            ResourceServices.ServiceResult res = resultItr.next();
            return res.getContent(new StringHandle()).get();
        }

    }
    private class QueryOptionsGenerator extends ResourceManager {
        private static final String NAME = "ml:searchOptionsGenerator";

        private RequestParameters params = new RequestParameters();

        QueryOptionsGenerator(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        String generateOptions(List<JsonNode> entities) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode node = objectMapper.valueToTree(entities);
                ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, new JacksonHandle(node));
                if (resultItr == null || ! resultItr.hasNext()) {
                    throw new IOException("Unable to generate query options");
                }
                ResourceServices.ServiceResult res = resultItr.next();
                return res.getContent(new StringHandle()).get();
            }
            catch(Exception e) {
                e.printStackTrace();
            }
            return "{}";
        }
    }

    private class DbIndexGenerator extends ResourceManager {
        private static final String NAME = "ml:dbConfigs";

        private RequestParameters params = new RequestParameters();

        DbIndexGenerator(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        public String getIndexes(List<JsonNode> entities) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode node = objectMapper.valueToTree(entities);
                ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, new JacksonHandle(node));
                if (resultItr == null || ! resultItr.hasNext()) {
                    throw new IOException("Unable to generate database indexes");
                }
                ResourceServices.ServiceResult res = resultItr.next();
                return res.getContent(new StringHandle()).get();
            }
            catch(Exception e) {
                e.printStackTrace();
            }
            return "{}";
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
            // get all the entities.
            List<JsonNode> entities = getAllEntities();
            if (entities.size() > 0) {
                PiiGenerator piiGenerator = new PiiGenerator(hubConfig.newReverseFlowClient());

                String v3Config = piiGenerator.piiGenerate(entities);
                JsonNode v3ConfigAsJson = null;
                v3ConfigAsJson = mapper.readTree(v3Config);

                ArrayNode paths = (ArrayNode) v3ConfigAsJson.get("config").get("protected-path");
                int i=0;
                // write each path as a separate file for ml-gradle
                Iterator<JsonNode> pathsIterator = paths.iterator();
                while (pathsIterator.hasNext()) {
                    JsonNode n = pathsIterator.next();
                    i++;
                    String thisPath = String.format("%02d_%s", i , HubConfig.PII_PROTECTED_PATHS_FILE);
                    File protectedPathConfig = protectedPaths.resolve(thisPath).toFile();
                    writer.writeValue(protectedPathConfig, n);
                }
                writer.writeValue(queryRolesetsConfig,  v3ConfigAsJson.get("config").get("query-roleset"));
            }
        } catch (IOException e) {
            throw new EntityServicesGenerationException("Protected path writing failed",e);
        }
        return true;
    }

}
