package com.marklogic.hub.factory;

import java.io.File;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.marklogic.client.io.Format;
import com.marklogic.hub.PluginFormat;
import com.marklogic.hub.Scaffolding;
import com.marklogic.hub.entity.Entity;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.model.FlowModel;
import com.marklogic.hub.service.SyncStatusService;

public class FlowModelFactory {

    private Map<String, Flow> flowsInServer = new LinkedHashMap<>();
    private String entityName;

    public FlowModelFactory(String entityName) {
        // use this when creating a new entity in the client
        this.entityName = entityName;
    }

    public FlowModelFactory(Entity entity, String entityName) {
        // use this when comparing flows in the client and server
        this.entityName = entityName;
        if (entity != null) {
            List<Flow> flows = entity.getFlows();
            if (flows != null) {
                for (Flow flow : flows) {
                    flowsInServer.put(flow.getName(), flow);
                }
            }
        }
    }

    public FlowModel createNewFlow(File userPluginDirPath, String flowName,
            FlowType flowType, PluginFormat pluginFormat, Format dataFormat) throws IOException {
        FlowModel flowModel = new FlowModel();
        flowModel.setEntityName(entityName);
        flowModel.setFlowName(flowName);
        flowModel.setSynched(false);

        Scaffolding.createFlow(entityName, flowName, flowType, pluginFormat,
                dataFormat, userPluginDirPath);

        File entityDirPath = Scaffolding.getFlowDir(userPluginDirPath,
                entityName, flowName, flowType);
        String absolutePath = entityDirPath.getAbsolutePath();
        TreeDataFactory treeDataFactory = new TreeDataFactory(absolutePath,
                flowName);
        flowModel.setTreeData(treeDataFactory.listFilesAndDirectories());
        return flowModel;
    }

    public FlowModel createFlow(String parentDirPath, String flowName,
            FlowType flowType, SyncStatusService syncStatusService) {
        FlowModel flowModel = new FlowModel();
        flowModel.setEntityName(entityName);
        flowModel.setFlowName(flowName);
        String absolutePath = parentDirPath + File.separator + flowName;
        TreeDataFactory treeDataFactory = new TreeDataFactory(absolutePath,
                flowName);
        flowModel.setTreeData(treeDataFactory.listFilesAndDirectories());
        Flow flow = this.flowsInServer.get(flowName);
        boolean synched = false;
        if (flow != null && flow.getType() != null
                && flowType.equals(flow.getType())) {
            synched = syncStatusService.isDirectorySynched(absolutePath);
        }
        flowModel.setSynched(synched);
        return flowModel;
    }
}
