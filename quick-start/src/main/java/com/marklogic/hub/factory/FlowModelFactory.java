package com.marklogic.hub.factory;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.marklogic.hub.domain.Domain;
import com.marklogic.hub.flow.Flow;
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

	public FlowModel createNewFlow(String parentDirPath, String flowName,
			FlowType flowType) {
		FlowModel flowModel = new FlowModel();
		flowModel.setDomainName(domainName);
		flowModel.setFlowName(flowName);
		flowModel.setSynched(false);
		this.createEmptyFlowDirectories(parentDirPath, flowName, flowType);
		DirectoryModelFactory directoryModelFactory = new DirectoryModelFactory(
				parentDirPath, flowName);
		flowModel.setDirectory(directoryModelFactory.listFilesAndDirectories());
		return flowModel;
	}

	private void createEmptyFlowDirectories(String parentDirPath,
			String flowName, FlowType flowType) {
		String newFlowPath = FileUtil.createFolderIfNecessary(parentDirPath,
				flowName);
		// create empty plugin directories
		DirectoryModelFactory directoryModelFactory = new DirectoryModelFactory(
				parentDirPath, flowName);
		directoryModelFactory.addEmptyDirectories(newFlowPath, new String[] {
				"content", "headers", "triples", "validations" });
		if (flowType == FlowType.CONFORM) {
			directoryModelFactory.addEmptyDirectories(newFlowPath,
					new String[] { "custom-flow", "collector", "writer" });
			directoryModelFactory.addDirectory(newFlowPath, "egress",
					new String[] { "document-transforms", "search-options",
							"REST-extensions" });
		}
		directoryModelFactory.saveDirectories();
	}

	public FlowModel createFlow(String flowsFilePath, String flowName,
			FlowType flowType) {
		FlowModel flowModel = new FlowModel();
		flowModel.setDomainName(domainName);
		flowModel.setFlowName(flowName);
		DirectoryModelFactory directoryModelFactory = new DirectoryModelFactory(
				flowsFilePath, flowName);
		flowModel.setDirectory(directoryModelFactory.listFilesAndDirectories());
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
