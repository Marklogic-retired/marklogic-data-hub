package com.marklogic.hub.web.form;

public class DomainForm extends BaseForm {

	private String domainName;
	private String inputFlowName;
	private String conformFlowName;
	
	public String getDomainName() {
		return domainName;
	}
	public void setDomainName(String domainName) {
		this.domainName = domainName;
	}
	public String getInputFlowName() {
		return inputFlowName;
	}
	public void setInputFlowName(String inputFlowName) {
		this.inputFlowName = inputFlowName;
	}
	public String getConformFlowName() {
		return conformFlowName;
	}
	public void setConformFlowName(String conformFlowName) {
		this.conformFlowName = conformFlowName;
	}
	
	
}
