/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.entity.HubEntity;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.validate.EntitiesValidator;
import com.marklogic.hub.web.model.FlowModel;
import com.marklogic.hub.web.model.PluginModel;
import com.marklogic.hub.web.model.entity_services.EntityModel;
import com.marklogic.hub.web.model.entity_services.HubUIData;
import com.marklogic.hub.web.model.entity_services.InfoType;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.*;

@Service
public class EntityManagerService {

    private static final String UI_LAYOUT_FILE = "entities.layout.json";
    private static final String PLUGINS_DIR = "plugins";
    private static final String ENTITIES_DIR = "entities";
    public static final String ENTITY_FILE_EXTENSION = ".entity.json";

    @Autowired
    EntityManager em;

    @Autowired
    HubConfigImpl hubConfig;

    @Autowired
    Scaffolding scaffolding;

    @Autowired
    private LegacyFlowManagerService legacyFlowManagerService;

    @Autowired
    private DataHubService dataHubService;

    @Autowired
    private MappingManagerService mappingManagerService;

    public List<EntityModel> getLegacyEntities() throws IOException {
        List<EntityModel> entities = new ArrayList<>();
        Path entitiesDir = hubConfig.getHubProject().getLegacyHubEntitiesDir();
        List<String> entityNames = FileUtil.listDirectFolders(entitiesDir.toFile());
        for (String entityName : entityNames) {
            EntityModel entityModel = new EntityModel();
            InfoType infoType = new InfoType();
            infoType.setTitle(entityName);
            entityModel.setInfo(infoType);
            entityModel.inputFlows = legacyFlowManagerService.getFlows(entityName, FlowType.INPUT);
            entityModel.harmonizeFlows = legacyFlowManagerService.getFlows(entityName, FlowType.HARMONIZE);
            entities.add(entityModel);
        }
        return entities;
    }

    public List<EntityModel> getEntities() throws IOException {
        Map<String, HubUIData> hubUiData = getUiData();
        List<EntityModel> entities = new ArrayList<>();

        List<HubEntity> entityList = em.getEntities();

        for (HubEntity entity : entityList) {
            EntityModel entityModel = EntityModel.fromJson(entity.getFilename(), entity.toJson());
            if (entityModel != null) {
                HubUIData data = hubUiData.get(entityModel.getInfo().getTitle());
                if (data == null) {
                    data = new HubUIData();
                }
                entityModel.setHubUi(data);
                entityModel.inputFlows = legacyFlowManagerService.getFlows(entity.getInfo().getTitle(), FlowType.INPUT);
                entityModel.harmonizeFlows = legacyFlowManagerService.getFlows(entity.getInfo().getTitle(), FlowType.HARMONIZE);

                entities.add(entityModel);
            }
        }

        return entities;
    }

    public EntityModel createEntity(EntityModel newEntity) throws IOException {
        scaffolding.createEntity(newEntity.getName());
        return getEntity(newEntity.getName());
    }

    public EntityModel saveEntity(EntityModel entity) throws IOException {
        JsonNode node = entity.toJson();
        String fullpath = entity.getFilename();

        HubEntity hubEntity = HubEntity.fromJson(fullpath, node);


        if (fullpath == null) {
            em.saveEntity(hubEntity, false);
        }
        else {
            HubEntity renamedEntity = em.saveEntity(hubEntity, true);
            entity.setFilename(renamedEntity.getFilename());

            // Redeploy the flows
            dataHubService.reinstallUserModules(hubConfig, null, null);
        }


        return entity;
    }

    public void deleteEntity(String entity) throws IOException {
        String entityFileName = entity + ENTITY_FILE_EXTENSION;
        File entitiesFile = hubConfig.getHubEntitiesDir().resolve(entityFileName).toFile();
        if (entitiesFile.exists()) {
            em.deleteEntity(entity);
            dataHubService.deleteDocument("/entities/" + entityFileName, DatabaseKind.STAGING);
            dataHubService.deleteDocument("/entities/" + entityFileName, DatabaseKind.FINAL);
        }
    }

    public void deploySearchOptions() {
        em.deployQueryOptions();
    }

    public void saveDbIndexes() {
        em.saveDbIndexes();
    }

    public void savePii() {
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

        Path dir = hubConfig.getUserConfigDir();
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

        Path dir = hubConfig.getUserConfigDir();
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

    public FlowModel createFlow(String entityName, FlowType flowType, FlowModel newFlow) throws IOException {
        newFlow.entityName = entityName;
        if(newFlow.mappingName != null) {
            try {
                String mappingName = mappingManagerService.getMapping(newFlow.mappingName, false).getVersionedName();
                newFlow.mappingName = mappingName;
            } catch (DataHubProjectException e) {
                throw new DataHubProjectException("Mapping not found in project: " + newFlow.mappingName);
            }
        }
        scaffolding.createLegacyFlow(entityName, newFlow.flowName, flowType, newFlow.codeFormat, newFlow.dataFormat, newFlow.useEsModel, newFlow.mappingName);
        return getFlow(entityName, flowType, newFlow.flowName);
    }

    public void deleteFlow(String entityName, String flowName, FlowType flowType) throws IOException {
        Path flowDir = scaffolding.getLegacyFlowDir(entityName, flowName, flowType);
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
        EntitiesValidator validator = EntitiesValidator.create(config.newStagingClient());
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
        Path dir = hubConfig.getUserConfigDir();
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
