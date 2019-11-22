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
import com.marklogic.hub.entity.*;
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
    public void generateExplorerQueryOptions() {
        QueryOptionsGenerator generator = new QueryOptionsGenerator(hubConfig.newStagingClient());
        try {
            Path dir = hubProject.getEntityConfigDir();
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }
            List<JsonNode> entities = getAllEntities();
            if (entities.size() > 0) {
                File expStagingFile = Paths.get(dir.toString(), HubConfig.EXP_STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile();
                File expFinalFile = Paths.get(dir.toString(), HubConfig.EXP_FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile();
                String options = generator.generateOptions(entities, true);
                FileUtils.writeStringToFile(expStagingFile, options);
                FileUtils.writeStringToFile(expFinalFile, options);
            }
        } catch (IOException e) {
            throw new RuntimeException("Unable to generate query options; cause: " + e.getMessage(), e);
        }
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

    private boolean deployExpFinalQueryOptions() {
        return deployQueryOptions(hubConfig.newFinalClient(), HubConfig.EXP_FINAL_ENTITY_QUERY_OPTIONS_FILE);
    }

    private boolean deployExpStagingQueryOptions() {
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
        return new HubModuleManager(timestampFile);
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
        return getEntityFromProject(entityName, null, Boolean.FALSE);
    }

    public HubEntity getEntityFromProject(String entityName, String version) {
        return getEntityFromProject(entityName, version, Boolean.FALSE);
    }

    @Override
    public HubEntity getEntityFromProject(String entityName, Boolean extendSubEntities) {
        return getEntityFromProject(entityName, null, extendSubEntities);
    }

    @Override
    public HubEntity getEntityFromProject(String entityName, String version, Boolean extendSubEntities) {
        return getEntityFromProject(entityName, getEntities(), version, extendSubEntities);
    }

    /**
     * Extracted for unit testing so that it doesn't depend on entity model files existing within a project directory structure.
     * This method also "flattens" the entity models that are passed into it. Currently, the entity title and version
     * number are used to uniquely reference an entity definition - unless version is null, in which case only the entity title
     * is used to reference an entity definition.
     *
     * @param entityName
     * @param modelFilesInProject
     * @param version
     * @param extendSubEntities
     * @return
     */
    protected HubEntity getEntityFromProject(String entityName, List<HubEntity> modelFilesInProject, String version, Boolean extendSubEntities) {
        List<HubEntity> entityDefinitions = convertModelFilesToEntityDefinitions(modelFilesInProject);
        return getEntityFromEntityDefinitions(entityName, entityDefinitions, version, extendSubEntities);
    }

    /**
     * @param entityName
     * @param entityDefinitions each HubEntity in this list is expected to have a single definition in it. In addition, the
     *                          order of these definitions matters in case the version parameter is null.
     * @param version
     * @param extendSubEntities
     * @return
     */
    protected HubEntity getEntityFromEntityDefinitions(String entityName, List<HubEntity> entityDefinitions, String version, Boolean extendSubEntities) {
        HubEntity entity = null;
        for (HubEntity e : entityDefinitions) {
            InfoType info = e.getInfo();
            if (entityName.equals(info.getTitle()) && (version == null || version.equals(info.getVersion()))) {
                entity = e;
                if (extendSubEntities) {
                    addSubProperties(entity, entityDefinitions, version);
                }
                break;
            }
        }
        return entity;
    }

    /**
     * An entity model file can contain one to many entity definitions. This method then produces a list of HubEntity
     * instances, where each instance has a single entity definition. The filename is preserved on each HubEntity, but
     * the InfoType/Title property is modified to match that of the single entity definition that the HubEntity contains.
     *
     * @param modelFilesInProject
     * @return
     */
    protected List<HubEntity> convertModelFilesToEntityDefinitions(List<HubEntity> modelFilesInProject) {
        List<HubEntity> flattenedModels = new ArrayList<>();
        for (HubEntity model : modelFilesInProject) {
            Map<String, DefinitionType> map = model.getDefinitions().getDefinitions();
            for (String entityTitle : map.keySet()) {
                InfoType newInfo = new InfoType();
                newInfo.setBaseUri(model.getInfo().getBaseUri());
                newInfo.setDescription(model.getInfo().getDescription());
                newInfo.setTitle(entityTitle);
                newInfo.setVersion(model.getInfo().getVersion());

                DefinitionsType definitionsType = new DefinitionsType();
                definitionsType.addDefinition(entityTitle, map.get(entityTitle));

                HubEntity newModel = new HubEntity();
                newModel.setFilename(model.getFilename());
                newModel.setInfo(newInfo);
                newModel.setDefinitions(definitionsType);
                flattenedModels.add(newModel);
            }
        }
        return flattenedModels;
    }

    /**
     * Adds "sub" properties - i.e. each complex property type is expanded so that it contains all of the properties
     * from the referenced entity definition type. This is a recursive method, thus ensuring that properties are added
     * at any depth of nested entities.
     *
     * @param entity
     * @param entityDefinitions
     * @param version
     */
    protected void addSubProperties(HubEntity entity, List<HubEntity> entityDefinitions, String version) {
        Map<String, DefinitionType> definitions = entity.getDefinitions().getDefinitions();
        for (String definitionName : definitions.keySet()) {
            DefinitionType definition = definitions.get(definitionName);
            for (PropertyType property : definition.getProperties()) {
                String ref = property.getRef();
                ItemType items = property.getItems();
                if ((ref == null || "".equals(ref)) && items != null) {
                    ref = items.getRef();
                }
                if (!(ref == null || "".equals(ref))) {
                    String subEntityName = ref.substring(ref.lastIndexOf('/') + 1);
                    HubEntity subEntity = getEntityFromEntityDefinitions(subEntityName, entityDefinitions, version, true);
                    if (subEntity != null) {
                        DefinitionType subDefinition = subEntity.getDefinitions().getDefinitions().get(subEntityName);
                        property.setSubProperties(subDefinition.getProperties());
                    }
                }
            }
        }

    }

    public List<HubEntity> getEntities() {
        return getEntities(Boolean.FALSE);
    }

    @Override
    public List<HubEntity> getEntities(Boolean extendSubEntities) {
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

        removeCollationFromEntityReferenceProperties(node);

        String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
        FileUtils.writeStringToFile(new File(fullpath), json);

        return entity;
    }

    /**
     * Per DHFPROD-3472, when a property in QS is changed to an entity reference, a collation is still defined for it.
     * This method removes the collation for any property that is an entity reference.
     *
     * @param node
     */
    protected void removeCollationFromEntityReferenceProperties(JsonNode node) {
        if (node != null && node.has("definitions")) {
            JsonNode definitions = node.get("definitions");
            Iterator<String> fieldNames = definitions.fieldNames();
            while (fieldNames.hasNext()) {
                JsonNode entity = definitions.get(fieldNames.next());
                if (entity.has("properties")) {
                    JsonNode properties = entity.get("properties");
                    Iterator<String> propertyNames = properties.fieldNames();
                    while (propertyNames.hasNext()) {
                        JsonNode property = properties.get(propertyNames.next());
                        if (property.has("$ref") && property.has("collation")) {
                            ((ObjectNode) property).remove("collation");
                        }
                    }
                }
            }
        }
    }

    public void deleteEntity(String entity) {
        Path entityPath = hubConfig.getHubEntitiesDir().resolve(entity + ENTITY_FILE_EXTENSION);
        if (entityPath.toFile().exists()) {
            entityPath.toFile().delete();
        }
    }

    private class PiiGenerator extends ResourceManager {
        private static final String NAME = "mlPiiGenerator";
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
        private static final String NAME = "mlSearchOptionsGenerator";

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
