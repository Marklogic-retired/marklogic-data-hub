package com.marklogic.hub.factory;

import java.io.File;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.marklogic.client.io.Format;
import com.marklogic.hub.PluginFormat;
import com.marklogic.hub.Scaffolding;
import com.marklogic.hub.domain.Domain;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.model.FlowModel;

public class FlowModelFactory {

    private Map<String, Flow> flowsInServer = new LinkedHashMap<>();
    private String domainName;

    public FlowModelFactory(String domainName) {
        // use this when creating a new domain in the client
        this.domainName = domainName;
    }

    public FlowModelFactory(Domain domain, String domainName) {
        // use this when comparing flows in the client and server
        this.domainName = domainName;
        if (domain != null) {
            List<Flow> flows = domain.getFlows();
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
        flowModel.setDomainName(domainName);
        flowModel.setFlowName(flowName);
        flowModel.setSynched(false);

        Scaffolding.createFlow(domainName, flowName, flowType, pluginFormat, dataFormat, userPluginDirPath);

        File domainDirPath = Scaffolding.getFlowDir(userPluginDirPath, domainName, flowName, flowType);
        String absolutePath = domainDirPath.getAbsolutePath();
        TreeDataFactory treeDataFactory = new TreeDataFactory(absolutePath,
                flowName);
        flowModel.setTreeData(treeDataFactory.listFilesAndDirectories());
        return flowModel;
    }

    public FlowModel createFlow(String parentDirPath, String flowName,
            FlowType flowType) {
        FlowModel flowModel = new FlowModel();
        flowModel.setDomainName(domainName);
        flowModel.setFlowName(flowName);
        String absolutePath = parentDirPath + File.separator + flowName;
        TreeDataFactory treeDataFactory = new TreeDataFactory(absolutePath,
                flowName);
        flowModel.setTreeData(treeDataFactory.listFilesAndDirectories());
        Flow flow = this.flowsInServer.get(flowName);
        boolean synched = false;
        // TODO: confirm the value of the collector's type
        if (flow != null && flow.getCollector() != null
                && flowType.equals(flow.getCollector().getType())) {
            synched = true;
        }
        flowModel.setSynched(synched);
        return flowModel;
    }
}
