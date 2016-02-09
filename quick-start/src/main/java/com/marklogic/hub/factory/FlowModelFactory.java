package com.marklogic.hub.factory;

import java.io.File;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.marklogic.hub.domain.Domain;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.model.DirectoryModel;
import com.marklogic.hub.model.FlowModel;
import com.marklogic.hub.model.FlowType;
import com.marklogic.hub.util.FileUtil;

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

	public FlowModel createNewFlow(String userPluginDir, String flowName,
			FlowType flowType) {
		FlowModel flowModel = new FlowModel();
		flowModel.setDomainName(domainName);
		flowModel.setFlowName(flowName);
		this.createEmptyFlowDirectories(userPluginDir, flowName, flowType);
		return flowModel;
	}
	
	private void createEmptyFlowDirectories(String userPluginDir, String flowName,
			FlowType flowType) {
		String flowPath = userPluginDir + File.separator
				+ FileUtil.DOMAINS_FOLDER + File.separator + domainName
				+ File.separator + flowType.getName();
		FileUtil.createFolderIfNecessary(flowPath, flowName);
		//create empty plugin directories
		DirectoryModelFactory directoryModelFactory = new DirectoryModelFactory(flowName);
		DirectoryModel directoryModel = directoryModelFactory.getDirectoryModel();
		directoryModelFactory.addEmptyDirectories(new String[]{"content", "headers", "triples", "validations"});
		if(flowType == FlowType.CONFORM) {
			directoryModelFactory.addEmptyDirectories(new String[]{"custom-flow", "collector", "writer"});
			directoryModelFactory.addDirectory("egress", new String[]{"document-transforms", "search-options", "REST-extensions"});
		}
		FileUtil.createDirectories(directoryModel);
	}

	public FlowModel createFlow(String flowName, FlowType flowType) {
		FlowModel flowModel = new FlowModel();
		flowModel.setDomainName(domainName);
		flowModel.setFlowName(flowName);
		Flow flow = this.flowsInServer.get(flowName);
		boolean synched = false;
		// TODO: confirm the value of the collector's type
		if (flow != null && flow.getCollector() != null
				&& flowType.getType().equals(flow.getCollector().getType())) {
			synched = true;
		}
		flowModel.setSynched(synched);
		return flowModel;
	}

}
