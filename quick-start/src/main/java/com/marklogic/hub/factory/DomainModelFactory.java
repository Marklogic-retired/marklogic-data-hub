package com.marklogic.hub.factory;

import java.io.File;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.marklogic.hub.domain.Domain;
import com.marklogic.hub.model.DomainModel;
import com.marklogic.hub.model.FlowModel;
import com.marklogic.hub.model.FlowType;
import com.marklogic.hub.util.FileUtil;

public class DomainModelFactory {

	private Map<String, Domain> domainsInServer = new LinkedHashMap<>();

	public DomainModelFactory(List<Domain> domains) {
		if (domains != null) {
			for (Domain domain : domains) {
				domainsInServer.put(domain.getName(), domain);
			}
		}
	}

	public DomainModel createDomain(String domainName, String domainFilePath) {
		DomainModel domainModel = new DomainModel();
		domainModel.setDomainName(domainName);
		domainModel.setSynched(this.domainsInServer.containsKey(domainName));

		FlowModelFactory flowModelFactory = new FlowModelFactory(
				this.domainsInServer.get(domainName), domainName);
		domainModel.setInputFlows(this.getInputFlows(flowModelFactory,
				domainFilePath));
		domainModel.setConformFlows(this.getConformFlows(flowModelFactory,
				domainFilePath));

		return domainModel;
	}

	private List<FlowModel> getInputFlows(FlowModelFactory flowModelFactory,
			String domainFilePath) {
		return this.getFlows(flowModelFactory, domainFilePath, FlowType.INPUT);
	}

	private List<FlowModel> getConformFlows(FlowModelFactory flowModelFactory,
			String domainFilePath) {
		return this
				.getFlows(flowModelFactory, domainFilePath, FlowType.CONFORM);
	}

	private List<FlowModel> getFlows(FlowModelFactory flowModelFactory,
			String domainFilePath, FlowType flowType) {
		List<FlowModel> flows = new ArrayList<>();
		List<String> flowNames = FileUtil.listDirectFolders(domainFilePath
				+ File.separator + flowType);
		for (String flowName : flowNames) {
			FlowModel flowModel = flowModelFactory.createFlow(flowName,
					flowType);
			flows.add(flowModel);
		}
		return flows;
	}

}
