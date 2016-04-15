package com.marklogic.hub.factory;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.marklogic.client.io.Format;
import com.marklogic.hub.PluginFormat;
import com.marklogic.hub.Scaffolding;
import com.marklogic.hub.entity.Entity;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.model.EntityModel;
import com.marklogic.hub.model.FlowModel;
import com.marklogic.hub.model.RestModel;
import com.marklogic.hub.service.SyncStatusService;
import com.marklogic.hub.util.FileUtil;

public class EntityModelFactory {

    private Map<String, Entity> entitiesInServer = new LinkedHashMap<>();

    public EntityModelFactory() {
        // use this when creating a new entity in the client
    }

    public EntityModelFactory(List<Entity> entities) {
        // use this when comparing entities in the client and server
        if (entities != null) {
            for (Entity entity : entities) {
                entitiesInServer.put(entity.getName(), entity);
            }
        }
    }

    public EntityModel createNewEntity(File userPluginDir, String entityName,
            String inputFlowName, String harmonizeFlowName, PluginFormat pluginFormat,
            Format dataFormat) throws IOException {
        EntityModel entityModel = new EntityModel();
        entityModel.setEntityName(entityName);
        entityModel.setInputFlows(new ArrayList<>());
        entityModel.setHarmonizeFlows(new ArrayList<>());

        Scaffolding.createEntity(entityName, userPluginDir);

        FlowModelFactory flowModelFactory = new FlowModelFactory(entityName);
        if (inputFlowName != null) {
            FlowModel inputFlow = flowModelFactory.createNewFlow(userPluginDir,
                    inputFlowName, FlowType.INPUT, pluginFormat, dataFormat);
            entityModel.getInputFlows().add(inputFlow);
        }

        if (harmonizeFlowName != null) {
            FlowModel harmonizeFlow = flowModelFactory.createNewFlow(
                    userPluginDir, harmonizeFlowName,
                    FlowType.HARMONIZE, pluginFormat,
                    dataFormat);
            entityModel.getHarmonizeFlows().add(harmonizeFlow);
        }

        return entityModel;
    }

    public EntityModel createEntity(String entityName, String entityFilePath, SyncStatusService syncStatusService) {
        EntityModel entityModel = new EntityModel();
        entityModel.setEntityName(entityName);
        //this will be updated after traversing its modules
        entityModel.setSynched(this.entitiesInServer.containsKey(entityName));

        FlowModelFactory flowModelFactory = new FlowModelFactory(
                this.entitiesInServer.get(entityName), entityName);
        RestModelFactory restModelFactory = new RestModelFactory(entityName);
        setEntityModules(entityModel, entityFilePath, flowModelFactory, restModelFactory, syncStatusService);

        return entityModel;
    }

    //set the values of modules of the entity such as flows, rest, etc.
    private void setEntityModules(EntityModel entityModel, String entityFilePath,
            FlowModelFactory flowModelFactory, RestModelFactory restModelFactory, SyncStatusService syncStatusService) {
        this.setEntityModules(entityModel, entityFilePath, FlowType.INPUT, flowModelFactory, restModelFactory, syncStatusService);
        this.setEntityModules(entityModel, entityFilePath, FlowType.HARMONIZE, flowModelFactory, restModelFactory, syncStatusService);
    }

    private void setEntityModules(EntityModel entityModel, String entityFilePath,
            FlowType flowType, FlowModelFactory flowModelFactory,
            RestModelFactory restModelFactory, SyncStatusService syncStatusService) {
        String modulesParentDirectory = entityFilePath + File.separator
                + flowType.toString();
        List<String> folderNames = FileUtil.listDirectFolders(modulesParentDirectory);

        List<FlowModel> flows = new ArrayList<>();
        RestModel restModel = null;
        for (String folderName : folderNames) {
            if (folderName.equalsIgnoreCase(RestModelFactory.REST_FOLDER_NAME)) {
                restModel = restModelFactory.createRest(modulesParentDirectory, syncStatusService);
                entityModel.setSynched(entityModel.isSynched() && restModel.isSynched());
            } else {
                FlowModel flowModel = flowModelFactory.createFlow(modulesParentDirectory,
                        folderName, flowType, syncStatusService);
                entityModel.setSynched(entityModel.isSynched() && flowModel.isSynched());
                flows.add(flowModel);
            }
        }
        if(flowType == FlowType.INPUT) {
            entityModel.setInputFlows(flows);
            entityModel.setInputRest(restModel);
        } else {
            entityModel.setHarmonizeFlows(flows);
            entityModel.setHarmonizeRest(restModel);
        }
    }

    public static Map<String, EntityModel> toEntityModelMap(
            List<EntityModel> entities) {
        Map<String, EntityModel> entityModelMap = new HashMap<String, EntityModel>();
        for (EntityModel model : entities) {
            entityModelMap.put(model.getEntityName(), model);
        }

        return entityModelMap;
    }
}
