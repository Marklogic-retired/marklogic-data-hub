package com.marklogic.hub.model;

public class FlowModel {

	private String domainName;
	private String flowName;
	private boolean isSynched;
	
	public String getDomainName() {
		return domainName;
	}
	public void setDomainName(String domainName) {
		this.domainName = domainName;
	}
	public String getFlowName() {
		return flowName;
	}
	public void setFlowName(String flowName) {
		this.flowName = flowName;
	}
	public boolean isSynched() {
		return isSynched;
	}
	public void setSynched(boolean isSynched) {
		this.isSynched = isSynched;
	}
}
