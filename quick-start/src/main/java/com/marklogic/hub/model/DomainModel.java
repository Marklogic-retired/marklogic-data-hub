package com.marklogic.hub.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class DomainModel {

	private String domainName;
	private List<FlowModel> inputFlows;
	private List<FlowModel> conformFlows;
	private boolean isSynched;
	
	public String getDomainName() {
		return domainName;
	}
	public void setDomainName(String domainName) {
		this.domainName = domainName;
	}
	public List<FlowModel> getInputFlows() {
		return inputFlows;
	}
	public void setInputFlows(List<FlowModel> inputFlows) {
		this.inputFlows = inputFlows;
	}
	public List<FlowModel> getConformFlows() {
		return conformFlows;
	}
	public void setConformFlows(List<FlowModel> conformFlows) {
		this.conformFlows = conformFlows;
	}
	public boolean isSynched() {
		return isSynched;
	}
	public void setSynched(boolean isSynched) {
		this.isSynched = isSynched;
	}
	
	
}

