package com.marklogic.hub.service;

import java.io.File;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.factory.FlowModelFactory;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.model.FlowModel;
import com.marklogic.hub.model.FlowType;
import com.marklogic.hub.util.FileUtil;

@Service
public class FlowManagerService {

	private static final Logger LOGGER = LoggerFactory
			.getLogger(FlowManagerService.class);

	@Autowired
	private EnvironmentConfiguration environmentConfiguration;

	public FlowManager getFlowManager() {

		Authentication authMethod = Authentication
				.valueOf(environmentConfiguration.getMLAuth().toUpperCase());
		DatabaseClient client = DatabaseClientFactory.newClient(
				environmentConfiguration.getMLHost(),
				Integer.parseInt(environmentConfiguration.getMLRestPort()),
				environmentConfiguration.getMLUsername(),
				environmentConfiguration.getMLPassword(), authMethod);
		return new FlowManager(client);

	}

	public List<Flow> getFlows(String domainName) {
		FlowManager flowManager = getFlowManager();
		return flowManager.getFlows(domainName);
	}

	public Flow getFlow(String domainName, String flowName) {
		FlowManager flowManager = getFlowManager();
		return flowManager.getFlow(domainName, flowName);
	}

	public void installFlow(Flow flow) {
		FlowManager flowManager = getFlowManager();
		flowManager.installFlow(flow);
	}

	public void uninstallFlow(String flowName) {
		FlowManager flowManager = getFlowManager();
		flowManager.uninstallFlow(flowName);
	}

	public void testFlow(Flow flow) {
		FlowManager flowManager = getFlowManager();
		flowManager.testFlow(flow);
	}

	public void runFlow(Flow flow, int batchSize) {
		FlowManager flowManager = getFlowManager();
		flowManager.runFlow(flow, batchSize);
	}

	public void runFlowsInParallel(Flow... flows) {
		FlowManager flowManager = getFlowManager();
		flowManager.runFlowsInParallel(flows);
	}

	public FlowModel createFlow(String domainName, String flowName,
			String flowType) {
		FlowModelFactory flowModelFactory = new FlowModelFactory(domainName);
		String parentDirPath = environmentConfiguration.getUserPluginDir()
				+ File.separator + FileUtil.DOMAINS_FOLDER + File.separator
				+ domainName + File.separator + flowType;
		FlowModel flowModel = flowModelFactory.createNewFlow(parentDirPath,
				flowName, FlowType.getFlowType(flowType));
		return flowModel;
	}
}
