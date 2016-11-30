package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.helper.LoggingObject;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.entity_services.EntityModel;
import com.marklogic.quickstart.model.entity_services.HubUIData;
import com.marklogic.quickstart.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class EntityManagerService extends LoggingObject {

    private static final String UI_LAYOUT_FILE = "entities.layout.json";
    private static final String PLUGINS_DIR = "plugins";
    private static final String ENTITIES_DIR = "entities";
    private static final String HUB_CONFIG_DIR = "hub-config";
    private static final String ENTITY_FILE_EXTENSION = ".entity.json";

    @Autowired
    private FlowManagerService flowManagerService;

    @Autowired
    private EnvironmentConfig envConfig;

    public List<EntityModel> getEntities() throws IOException {
        String projectDir = envConfig.getProjectDir();

        Map<String, HubUIData> hubUiData = getUiData();
        List<EntityModel> entities = new ArrayList<>();
        Path entitiesPath = Paths.get(envConfig.getProjectDir(), PLUGINS_DIR, ENTITIES_DIR);
        List<String> entityNames = FileUtil.listDirectFolders(entitiesPath.toFile());
        ObjectMapper objectMapper = new ObjectMapper();
        for (String entityName : entityNames) {
            File[] entityDefs = entitiesPath.resolve(entityName).toFile().listFiles((dir, name) -> name.endsWith(ENTITY_FILE_EXTENSION));
            for (File entityDef : entityDefs) {
                JsonNode node = objectMapper.readTree(entityDef);
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

    public EntityModel saveEntity(EntityModel entity) throws IOException {
        JsonNode node = entity.toJson();
        ObjectMapper objectMapper = new ObjectMapper();
        String filename = entity.getFilename();
        if (filename == null) {
            String title = entity.getInfo().getTitle();
            Path dir = Paths.get(envConfig.getProjectDir(), PLUGINS_DIR, ENTITIES_DIR, title);
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }
            filename = Paths.get(dir.toString(), title + ENTITY_FILE_EXTENSION).toString();
        }

        objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(filename), node);

        return entity;
    }

    public void deleteEntity(String entity) throws IOException {
        Path dir = Paths.get(envConfig.getProjectDir(), PLUGINS_DIR, ENTITIES_DIR, entity);
        if (dir.toFile().exists()) {
            FileUtils.deleteDirectory(dir.toFile());
        }
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

        Path dir = Paths.get(envConfig.getProjectDir(), HUB_CONFIG_DIR);
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
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, uiData);
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

        Path dir = Paths.get(envConfig.getProjectDir(), HUB_CONFIG_DIR);
        if (!dir.toFile().exists()) {
            dir.toFile().mkdirs();
        }
        File file = Paths.get(dir.toString(), UI_LAYOUT_FILE).toFile();

        JsonNode node = entity.getHubUi().toJson();
        uiData.set(entity.getInfo().getTitle(), node);

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, uiData);
    }

    public EntityModel getEntity(String entityName) throws IOException {
        List<EntityModel> entities = getEntities();

        for (EntityModel entity : entities) {
            if (entity.getName().equals(entityName)) {
                return entity;
            }
        }

        return null;
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

        return null;
    }

    public FlowModel createFlow(String projectDir, String entityName, FlowType flowType, FlowModel newFlow) throws IOException {
        Scaffolding scaffolding = new Scaffolding(projectDir, envConfig.getFinalClient());
        newFlow.entityName =entityName;
        scaffolding.createFlow(entityName, newFlow.flowName, flowType, newFlow.pluginFormat, newFlow.dataFormat, newFlow.useEsModel);
        return getFlow(entityName, flowType, newFlow.flowName);
    }

    private JsonNode getUiRawData() {
        JsonNode json = null;
        Path dir = Paths.get(envConfig.getProjectDir(), HUB_CONFIG_DIR);
        File file = Paths.get(dir.toString(), UI_LAYOUT_FILE).toFile();
        if (file.exists()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                json = objectMapper.readTree(file);
            }
            catch(IOException e) {}
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
