package com.marklogic.hub.factory;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.marklogic.hub.domain.Domain;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.model.FlowModel;
import com.marklogic.hub.model.FlowType;

public class FlowModelFactory {

	private Map<String, Flow> flowsInServer = new LinkedHashMap<>();
	private String domainName;
	
	public FlowModelFactory(Domain domain, String domainName) {
		this.domainName = domainName;
		if(domain!=null) {
			List<Flow> flows = domain.getFlows();
			if(flows != null) {
				for (Flow flow : flows) {
					flowsInServer.put(flow.getName(), flow);
				}
			}
		}
	}

	public FlowModel createFlow(String flowName, FlowType flowType) {
		FlowModel flowModel = new FlowModel();
		flowModel.setDomainName(domainName);
		flowModel.setFlowName(flowName);
		Flow flow = this.flowsInServer.get(flowName);
		boolean synched = false;
		//TODO: confirm the value of the collector's type
		if(flow!=null && flow.getCollector()!=null && flowType.getType().equals(flow.getCollector().getType())) {
			synched = true;
		}
		flowModel.setSynched(synched);
		return flowModel;
	}

}
