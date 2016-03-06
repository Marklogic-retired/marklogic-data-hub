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
            String inputFlowName, String conformFlowName, PluginFormat pluginFormat,
            Format dataFormat) throws IOException {
        EntityModel entityModel = new EntityModel();
        entityModel.setEntityName(entityName);
        entityModel.setInputFlows(new ArrayList<>());
        entityModel.setConformFlows(new ArrayList<>());

        Scaffolding.createEntity(entityName, userPluginDir);

        FlowModelFactory flowModelFactory = new FlowModelFactory(entityName);
        if (inputFlowName != null) {
            FlowModel inputFlow = flowModelFactory.createNewFlow(userPluginDir,
                    inputFlowName, FlowType.INPUT, pluginFormat, dataFormat);
            entityModel.getInputFlows().add(inputFlow);
        }

        if (conformFlowName != null) {
            FlowModel conformFlow = flowModelFactory.createNewFlow(
                    userPluginDir, conformFlowName,
                    FlowType.CONFORMANCE, pluginFormat,
                    dataFormat);
            entityModel.getConformFlows().add(conformFlow);
        }

        return entityModel;
    }

    public EntityModel createEntity(String entityName, String entityFilePath) {
        EntityModel entityModel = new EntityModel();
        entityModel.setEntityName(entityName);
        entityModel.setSynched(this.entitiesInServer.containsKey(entityName));

        FlowModelFactory flowModelFactory = new FlowModelFactory(
                this.entitiesInServer.get(entityName), entityName);
        entityModel.setInputFlows(this.getInputFlows(flowModelFactory,
                entityFilePath));
        entityModel.setConformFlows(this.getConformFlows(flowModelFactory,
                entityFilePath));

        return entityModel;
    }

    private List<FlowModel> getInputFlows(FlowModelFactory flowModelFactory,
            String entityFilePath) {
        return this.getFlows(flowModelFactory, entityFilePath, FlowType.INPUT);
    }

    private List<FlowModel> getConformFlows(FlowModelFactory flowModelFactory,
            String entityFilePath) {
        return this
                .getFlows(flowModelFactory, entityFilePath, FlowType.CONFORMANCE);
    }

    private List<FlowModel> getFlows(FlowModelFactory flowModelFactory,
            String entityFilePath, FlowType flowType) {
        List<FlowModel> flows = new ArrayList<>();
        String flowsFilePath = entityFilePath + File.separator
                + flowType.toString();
        List<String> flowNames = FileUtil.listDirectFolders(flowsFilePath);
        for (String flowName : flowNames) {
            FlowModel flowModel = flowModelFactory.createFlow(flowsFilePath,
                    flowName, flowType);
            flows.add(flowModel);
        }
        return flows;
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
