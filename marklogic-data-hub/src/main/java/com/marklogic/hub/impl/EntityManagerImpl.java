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
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.entity.HubEntity;
import com.marklogic.hub.entity.InfoType;
import com.marklogic.hub.error.EntityServicesGenerationException;
import com.marklogic.hub.util.HubModuleManager;
import org.apache.commons.io.FileUtils;
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
    private static final String ENTITY_FILE_EXTENSION = ".entity.json";

    @Autowired
    private HubConfig hubConfig;

    @Autowired
    private HubProject hubProject;

    private ObjectMapper mapper;

    public EntityManagerImpl() {
        mapper = new ObjectMapper();
    }

    @Override
    public boolean saveQueryOptions() {
        QueryOptionsGenerator generator = new QueryOptionsGenerator(hubConfig.newStagingClient());
        try {
            Path dir = hubProject.getEntityConfigDir();
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }

            File stagingFile = Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile();
            File finalFile = Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile();
            File expStagingFile = Paths.get(dir.toString(), HubConfig.EXP_STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile();
            File expFinalFile = Paths.get(dir.toString(), HubConfig.EXP_FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile();

            long lastModified = Math.max(stagingFile.lastModified(), finalFile.lastModified());
            List<JsonNode> entities = getModifiedRawEntities(lastModified);
            if (entities.size() > 0) {
                String options = generator.generateOptions(entities, false);
                FileUtils.writeStringToFile(stagingFile, options);
                FileUtils.writeStringToFile(finalFile, options);
                String expOptions = generator.generateOptions(entities, true);
                FileUtils.writeStringToFile(expStagingFile, expOptions);
                FileUtils.writeStringToFile(expFinalFile, expOptions);
                return true;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return false;
    }

    @Override
    public HashMap<Enum, Boolean> deployQueryOptions() {
        // save them first
        saveQueryOptions();

        HashMap<Enum, Boolean> loadedResources = new HashMap<>();
        if (deployFinalQueryOptions() && deployExpFinalQueryOptions()) loadedResources.put(DatabaseKind.FINAL, true);
        if (deployStagingQueryOptions() && deployExpStagingQueryOptions()) loadedResources.put(DatabaseKind.STAGING, true);
        return loadedResources;
    }


    public boolean deployFinalQueryOptions() {
        return deployQueryOptions(hubConfig.newFinalClient(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE);
    }

    public boolean deployStagingQueryOptions() {
        return deployQueryOptions(hubConfig.newStagingClient(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE);
    }

    public boolean deployExpFinalQueryOptions() {
        return deployQueryOptions(hubConfig.newFinalClient(), HubConfig.EXP_FINAL_ENTITY_QUERY_OPTIONS_FILE);
    }

    public boolean deployExpStagingQueryOptions() {
        return deployQueryOptions(hubConfig.newStagingClient(), HubConfig.EXP_STAGING_ENTITY_QUERY_OPTIONS_FILE);
    }

    private boolean deployQueryOptions(DatabaseClient client, String filename) {

        HubModuleManager propsManager = getPropsMgr();
        DefaultModulesLoader modulesLoader = new DefaultModulesLoader(new AssetFileLoader(hubConfig.newFinalClient(), propsManager));

        boolean isLoaded = false;

        modulesLoader.setModulesManager(propsManager);
        modulesLoader.setShutdownTaskExecutorAfterLoadingModules(false);

        AppConfig appConfig = hubConfig.getAppConfig();
        Path dir = hubProject.getEntityConfigDir();
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
        } catch (IOException e) {
            e.printStackTrace();
        }
        return false;
    }


    private HubModuleManager getPropsMgr() {
        String timestampFile = hubProject.getUserModulesDeployTimestampFile();
        HubModuleManager propertiesModuleManager = new HubModuleManager(timestampFile);
        return propertiesModuleManager;
    }

    private List<JsonNode> getAllEntities() {
        List<JsonNode> entities = new ArrayList<>(getAllLegacyEntities());
        Path entitiesPath = hubConfig.getHubEntitiesDir();
        File[] entityDefs = entitiesPath.toFile().listFiles(pathname -> pathname.toString().endsWith(ENTITY_FILE_EXTENSION) && !pathname.isHidden());
        if (entityDefs != null) {
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                for (File entityDef : entityDefs) {
                    FileInputStream fileInputStream = new FileInputStream(entityDef);
                    entities.add(objectMapper.readTree(fileInputStream));
                    fileInputStream.close();
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
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

    private List<JsonNode> getModifiedRawEntities(long minimumFileTimestampToLoad) {
        logger.debug("min modified: " + minimumFileTimestampToLoad);
        HubModuleManager propsManager = getPropsMgr();
        propsManager.setMinimumFileTimestampToLoad(minimumFileTimestampToLoad);

        List<JsonNode> entities = new ArrayList<>(getModifiedRawLegacyEntities(minimumFileTimestampToLoad));
        List<JsonNode> tempEntities = new ArrayList<>();
        Path entitiesPath = hubConfig.getHubEntitiesDir();
        File[] entityDefs = entitiesPath.toFile().listFiles(pathname -> pathname.toString().endsWith(ENTITY_FILE_EXTENSION) && !pathname.isHidden());
        if (entityDefs != null) {
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                boolean hasOneChanged = false;
                for (File entityDef : entityDefs) {
                    if (propsManager.hasFileBeenModifiedSinceLastLoaded(entityDef)) {
                        hasOneChanged = true;
                    }
                    FileInputStream fileInputStream = new FileInputStream(entityDef);
                    tempEntities.add(objectMapper.readTree(fileInputStream));
                    fileInputStream.close();
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

    private List<JsonNode> getModifiedRawLegacyEntities(long minimumFileTimestampToLoad) {
        HubModuleManager propsManager = getPropsMgr();
        propsManager.setMinimumFileTimestampToLoad(minimumFileTimestampToLoad);

        List<JsonNode> entities = new ArrayList<>();
        List<JsonNode> tempEntities = new ArrayList<>();
        Path entitiesPath = hubConfig.getHubProject().getLegacyHubEntitiesDir();
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

    public HubEntity getEntityFromProject(String entityName) {
        return getEntityFromProject(entityName, null);
    }

    public HubEntity getEntityFromProject(String entityName, String version) {
        HubEntity entity = null;
        for (HubEntity e: getEntities()) {
            InfoType info = e.getInfo();
            if (info.getTitle().equals(entityName) && (version == null || info.getVersion().equals(version))) {
                entity = e;
                break;
            }
        }
        return entity;
    }

    public List<HubEntity> getEntities() {
        List<HubEntity> entities = new ArrayList<>();
        Path entitiesPath = hubConfig.getHubEntitiesDir();
        ObjectMapper objectMapper = new ObjectMapper();
        File[] entityDefs = entitiesPath.toFile().listFiles((dir, name) -> name.endsWith(ENTITY_FILE_EXTENSION));
        if (entityDefs != null) {
            for (File entityDef : entityDefs) {
                try {
                    FileInputStream fileInputStream = new FileInputStream(entityDef);
                    JsonNode node = objectMapper.readTree(fileInputStream);
                    entities.add(HubEntity.fromJson(entityDef.getAbsolutePath(), node));
                    fileInputStream.close();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        }

        return entities;
    }

    public HubEntity saveEntity(HubEntity entity, Boolean rename) throws IOException {
        JsonNode node = entity.toJson();
        ObjectMapper objectMapper = new ObjectMapper();
        String fullpath = entity.getFilename();
        String title = entity.getInfo().getTitle();

        if (rename) {
            String filename = new File(fullpath).getName();
            String entityFromFilename = filename.substring(0, filename.indexOf(ENTITY_FILE_EXTENSION));
            if (!entityFromFilename.equals(title)) {
                // The entity name was changed since the files were created. Update
                // the path.

                // Update the name of the entity definition file
                File origFile = new File(fullpath);
                File newFile = new File(origFile.getParent() + File.separator + title + ENTITY_FILE_EXTENSION);
                if (!origFile.renameTo(newFile)) {
                    throw new IOException("Unable to rename " + origFile.getAbsolutePath() + " to " +
                        newFile.getAbsolutePath());
                }
                fullpath = newFile.getAbsolutePath();
                entity.setFilename(fullpath);
                // if legacy plugins dir exists, rename it as well
                Path origLegacyEntityDir = hubProject.getLegacyHubEntitiesDir().resolve(entityFromFilename);
                if (origLegacyEntityDir.toFile().exists()) {
                    Path newLegacyEntityDir = hubProject.getLegacyHubEntitiesDir().resolve(title);
                    FileUtils.moveDirectory(origLegacyEntityDir.toFile(), newLegacyEntityDir.toFile());
                }
            }
        } else {
            Path dir = hubConfig.getHubEntitiesDir();
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }
            fullpath = Paths.get(dir.toString(), title + ENTITY_FILE_EXTENSION).toString();
        }


        String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
        FileUtils.writeStringToFile(new File(fullpath), json);

        return entity;
    }

    public void deleteEntity(String entity) throws IOException {
        Path entityPath = hubConfig.getHubEntitiesDir().resolve(entity + ENTITY_FILE_EXTENSION);
        if (entityPath.toFile().exists()) {
            entityPath.toFile().delete();
        }
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
            if (resultItr == null || !resultItr.hasNext()) {
                throw new EntityServicesGenerationException("Unable to generate pii config");
            }
            ResourceServices.ServiceResult res = resultItr.next();
            return res.getContent(new StringHandle()).get();
        }

    }

    private class QueryOptionsGenerator extends ResourceManager {
        private static final String NAME = "ml:searchOptionsGenerator";

        QueryOptionsGenerator(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        String generateOptions(List<JsonNode> entities, boolean forExplorer) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode node = objectMapper.valueToTree(entities);
                RequestParameters params = new RequestParameters();
                params.put("forExplorer", Boolean.toString(forExplorer));

                ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, new JacksonHandle(node));
                if (resultItr == null || !resultItr.hasNext()) {
                    throw new IOException("Unable to generate query options");
                }
                ResourceServices.ServiceResult res = resultItr.next();
                return res.getContent(new StringHandle()).get();
            } catch (Exception e) {
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
        } catch (IOException e) {
            throw new EntityServicesGenerationException("Protected path writing failed", e);
        }
        return true;
    }

}
