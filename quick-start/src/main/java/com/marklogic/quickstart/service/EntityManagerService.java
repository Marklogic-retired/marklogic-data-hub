/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.validate.EntitiesValidator;
import com.marklogic.quickstart.EnvironmentAware;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.PluginModel;
import com.marklogic.quickstart.model.entity_services.EntityModel;
import com.marklogic.quickstart.model.entity_services.HubUIData;
import com.marklogic.quickstart.model.entity_services.InfoType;
import com.marklogic.quickstart.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.*;

@Service
public class EntityManagerService extends EnvironmentAware {

    private static final String UI_LAYOUT_FILE = "entities.layout.json";
    private static final String PLUGINS_DIR = "plugins";
    private static final String ENTITIES_DIR = "entities";
    public static final String ENTITY_FILE_EXTENSION = ".entity.json";

    @Autowired
    private FlowManagerService flowManagerService;

    @Autowired
    private FileSystemWatcherService watcherService;

    @Autowired
    private DataHubService dataHubService;

    public List<EntityModel> getLegacyEntities() throws IOException {
        String projectDir = envConfig().getProjectDir();
        List<EntityModel> entities = new ArrayList<>();
        Path entitiesDir = envConfig().getMlSettings().getHubEntitiesDir();
        List<String> entityNames = FileUtil.listDirectFolders(entitiesDir.toFile());
        for (String entityName : entityNames) {
            EntityModel entityModel = new EntityModel();
            InfoType infoType = new InfoType();
            infoType.setTitle(entityName);
            entityModel.setInfo(infoType);
            entityModel.inputFlows = flowManagerService.getFlows(projectDir, entityName, FlowType.INPUT);
            entityModel.harmonizeFlows = flowManagerService.getFlows(projectDir, entityName, FlowType.HARMONIZE);
            entities.add(entityModel);
        }
        return entities;
    }

    public List<EntityModel> getEntities() throws IOException {
        if (envConfig().getMarklogicVersion().startsWith("8")) {
            return getLegacyEntities();
        }

        String projectDir = envConfig().getProjectDir();

        Map<String, HubUIData> hubUiData = getUiData();
        List<EntityModel> entities = new ArrayList<>();
        Path entitiesPath = Paths.get(envConfig().getProjectDir(), PLUGINS_DIR, ENTITIES_DIR);
        List<String> entityNames = FileUtil.listDirectFolders(entitiesPath.toFile());
        ObjectMapper objectMapper = new ObjectMapper();
        for (String entityName : entityNames) {
            File[] entityDefs = entitiesPath.resolve(entityName).toFile().listFiles((dir, name) -> name.endsWith(ENTITY_FILE_EXTENSION));
            for (File entityDef : entityDefs) {
                FileInputStream fileInputStream = new FileInputStream(entityDef);
                JsonNode node = objectMapper.readTree(fileInputStream);
                fileInputStream.close();
                EntityModel entityModel = EntityModel.fromJson(entityDef.getAbsolutePath(), node);
                if (entityModel != null) {
                    HubUIData data = hubUiData.get(entityModel.getInfo().getTitle());
                    if (data == null) {
                        data = new HubUIData();
                    }
                    entityModel.setHubUi(data);
                    entityModel.inputFlows = flowManagerService.getFlows(projectDir, entityName, FlowType.INPUT);
                    entityModel.harmonizeFlows = flowManagerService.getFlows(projectDir, entityName, FlowType.HARMONIZE);

                    entities.add(entityModel);
                }
            }
        }

        return entities;
    }

    public EntityModel createEntity(String projectDir, EntityModel newEntity) throws IOException {
        Scaffolding scaffolding = Scaffolding.create(projectDir, envConfig().getFinalClient());
        scaffolding.createEntity(newEntity.getName());

        if (newEntity.inputFlows != null) {
            for (FlowModel flow : newEntity.inputFlows) {
                scaffolding.createFlow(newEntity.getName(), flow.flowName, FlowType.INPUT, flow.codeFormat, flow.dataFormat);
            }
        }

        if (newEntity.harmonizeFlows != null) {
            for (FlowModel flow : newEntity.harmonizeFlows) {
                scaffolding.createFlow(newEntity.getName(), flow.flowName, FlowType.HARMONIZE, flow.codeFormat, flow.dataFormat);
            }
        }

        return getEntity(newEntity.getName());
    }

    public EntityModel saveEntity(EntityModel entity) throws IOException {
        JsonNode node = entity.toJson();
        ObjectMapper objectMapper = new ObjectMapper();
        String fullpath = entity.getFilename();
        String title = entity.getInfo().getTitle();

        if (fullpath == null) {
            Path dir = Paths.get(envConfig().getProjectDir(), PLUGINS_DIR, ENTITIES_DIR, title);
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }
            fullpath = Paths.get(dir.toString(), title + ENTITY_FILE_EXTENSION).toString();
        }
        else {
            String filename = new File(fullpath).getName();
            String entityFromFilename = filename.substring(0, filename.indexOf(ENTITY_FILE_EXTENSION));
            if (!entityFromFilename.equals(entity.getName())) {
                // The entity name was changed since the files were created. Update
                // the path.

                // Update the name of the entity definition file
                File origFile = new File(fullpath);
                File newFile = new File(origFile.getParent() + File.separator + title + ENTITY_FILE_EXTENSION);
                if (!origFile.renameTo(newFile)) {
                    throw new IOException("Unable to rename " + origFile.getAbsolutePath() + " to " +
                        newFile.getAbsolutePath());
                };

                // Update the directory name
                File origDirectory = new File(origFile.getParent());
                File newDirectory = new File(origDirectory.getParent() + File.separator + title);
                if (!origDirectory.renameTo(newDirectory)) {
                    throw new IOException("Unable to rename " + origDirectory.getAbsolutePath() + " to " +
                        newDirectory.getAbsolutePath());
                }

                fullpath = newDirectory.getAbsolutePath() + File.separator + title + ENTITY_FILE_EXTENSION;
                entity.setFilename(fullpath);

                // Redeploy the flows
                dataHubService.reinstallUserModules(envConfig().getMlSettings(), null, null);
            }
        }


        String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
        FileUtils.writeStringToFile(new File(fullpath), json);

        return entity;
    }

    public void deleteEntity(String entity) throws IOException {
        Path dir = Paths.get(envConfig().getProjectDir(), PLUGINS_DIR, ENTITIES_DIR, entity);
        if (dir.toFile().exists()) {
            watcherService.unwatch(dir.getParent().toString());
            FileUtils.deleteDirectory(dir.toFile());
        }
    }

    //TODO Autowire in an Entity Manager
    public void deploySearchOptions(EnvironmentConfig environmentConfig) {
        EntityManager em = EntityManager.create(environmentConfig.getMlSettings());
        em.deployQueryOptions();
    }

    public void saveDbIndexes(EnvironmentConfig environmentConfig) {
        EntityManager em = EntityManager.create(environmentConfig.getMlSettings());
        em.saveDbIndexes();
    }

    public void savePii(EnvironmentConfig environmentConfig) {
        EntityManager em = EntityManager.create(environmentConfig.getMlSettings());
        em.savePii();
    }

    public void saveAllUiData(List<EntityModel> entities) throws IOException {
        ObjectNode uiData;
        JsonNode json = getUiRawData();
        if (json != null) {
            uiData = (ObjectNode) json;
        }
        else {
            uiData = JsonNodeFactory.instance.objectNode();
        }

        Path dir = Paths.get(envConfig().getProjectDir(), HubConfig.USER_CONFIG_DIR);
        if (!dir.toFile().exists()) {
            dir.toFile().mkdirs();
        }
        File file = Paths.get(dir.toString(), UI_LAYOUT_FILE).toFile();

        ObjectNode cUiData = uiData;
        entities.forEach((entity) -> {
            JsonNode node = entity.getHubUi().toJson();
            cUiData.set(entity.getInfo().getTitle(), node);
        });

        ObjectMapper objectMapper = new ObjectMapper();
        FileOutputStream fileOutputStream = new FileOutputStream(file);
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(fileOutputStream, uiData);
        fileOutputStream.flush();
        fileOutputStream.close();
    }

    public void saveEntityUiData(EntityModel entity) throws IOException {

        ObjectNode uiData;
        JsonNode json = getUiRawData();
        if (json != null) {
            uiData = (ObjectNode) json;
        }
        else {
            uiData = JsonNodeFactory.instance.objectNode();
        }

        Path dir = Paths.get(envConfig().getProjectDir(), HubConfig.USER_CONFIG_DIR);
        if (!dir.toFile().exists()) {
            dir.toFile().mkdirs();
        }
        File file = Paths.get(dir.toString(), UI_LAYOUT_FILE).toFile();

        JsonNode node = entity.getHubUi().toJson();
        uiData.set(entity.getInfo().getTitle(), node);

        ObjectMapper objectMapper = new ObjectMapper();
        FileOutputStream fileOutputStream = new FileOutputStream(file);
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(fileOutputStream, uiData);
        fileOutputStream.flush();
        fileOutputStream.close();
    }

    //Here goes the mapping stuff
    public JsonNode getAllMappingsForEntity(String entityName) throws IOException {
        EntityModel entity = this.getEntity(entityName);
        JsonNode mappings = JsonNodeFactory.instance.objectNode();
        return mappings;

    }

    public JsonNode getMappingForEntity(String entityName, String mapName) throws IOException{
        EntityModel entity = this.getEntity(entityName);
        JsonNode mappings = JsonNodeFactory.instance.objectNode();
        return mappings;
    }

    public void saveMappingForEntity(String entityName, String mapName, JsonNode mapping) throws IOException{
        EntityModel entity = this.getEntity(entityName);
    }

    public void deleteMappingForEntity(String entityName, String mapName) throws IOException{
        EntityModel entity = this.getEntity(entityName);
    }

    public EntityModel getEntity(String entityName) throws IOException {
        List<EntityModel> entities = getEntities();

        for (EntityModel entity : entities) {
            if (entity.getName().equals(entityName)) {
                return entity;
            }
        }
        throw new DataHubProjectException("Entity not found in project: " + entityName);
    }

    public FlowModel getFlow(String entityName, FlowType flowType, String flowName) throws IOException {
        EntityModel entity = getEntity(entityName);

        List<FlowModel> flows;
        if (flowType.equals(FlowType.INPUT)) {
            flows = entity.inputFlows;
        }
        else {
            flows = entity.harmonizeFlows;
        }

        for (FlowModel flow : flows) {
            if (flow.flowName.equals(flowName)) {
                return flow;
            }
        }

        throw new DataHubProjectException("Flow not found: " + entityName + " / " + flowName);
    }

    public FlowModel createFlow(String projectDir, String entityName, FlowType flowType, FlowModel newFlow) throws IOException {
        Scaffolding scaffolding = Scaffolding.create(projectDir, envConfig().getFinalClient());
        newFlow.entityName = entityName;
        scaffolding.createFlow(entityName, newFlow.flowName, flowType, newFlow.codeFormat, newFlow.dataFormat, newFlow.useEsModel);
        return getFlow(entityName, flowType, newFlow.flowName);
    }

    public void deleteFlow(String projectDir, String entityName, String flowName, FlowType flowType) throws IOException {
        Scaffolding scaffolding = Scaffolding.create(projectDir, envConfig().getFinalClient());
        Path flowDir = scaffolding.getFlowDir(entityName, flowName, flowType);
        FileUtils.deleteDirectory(flowDir.toFile());
    }

    public JsonNode validatePlugin(
        HubConfig config,
        String entityName,
        String flowName,
        PluginModel plugin
    ) throws IOException {
        JsonNode result = null;
        String type;
        if (plugin.pluginType.endsWith("sjs")) {
            type = "javascript";
        }
        else {
            type = "xquery";
        }
        EntitiesValidator validator = EntitiesValidator.create(config.newStagingManageClient());
        return validator.validate(entityName, flowName, plugin.fileContents.replaceAll("\\.(sjs|xqy)", ""), type, plugin.fileContents);
    }

    public void saveFlowPlugin(
        PluginModel plugin
    ) throws IOException {
        String pluginContent = plugin.fileContents;
        Files.write(Paths.get(plugin.pluginPath), pluginContent.getBytes(StandardCharsets.UTF_8), StandardOpenOption.TRUNCATE_EXISTING);

    }
    private JsonNode getUiRawData() {
        JsonNode json = null;
        Path dir = Paths.get(envConfig().getProjectDir(), HubConfig.USER_CONFIG_DIR);
        File file = Paths.get(dir.toString(), UI_LAYOUT_FILE).toFile();
        if (file.exists()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                json = objectMapper.readTree(file);
            }
            catch(IOException e) {
                e.printStackTrace();
            }
        }
        return json;
    }

    private Map<String, HubUIData> getUiData() throws IOException {
        HashMap<String, HubUIData> uiDataList = new HashMap<>();

        JsonNode json = getUiRawData();
        if (json != null) {
            Iterator<String> fieldItr = json.fieldNames();
            while (fieldItr.hasNext()) {
                String key = fieldItr.next();
                JsonNode uiNode = json.get(key);
                if (uiNode != null) {
                    HubUIData uiData = HubUIData.fromJson(uiNode);
                    uiDataList.put(key, uiData);
                }
            }
        }

        return uiDataList;
    }
}
