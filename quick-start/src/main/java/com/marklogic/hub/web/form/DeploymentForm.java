package com.marklogic.hub.web.form;

public class DeploymentForm {

	private String mlHost;
	private String mlUsername;
	private String mlPassword;
	private boolean serverValidated;
	private boolean serverAcceptable;
	private boolean installed;
	private boolean validServer;
	
	public String getMlHost() {
		return mlHost;
	}
	public void setMlHost(String mlHost) {
		this.mlHost = mlHost;
	}
	public String getMlUsername() {
		return mlUsername;
	}
	public void setMlUsername(String mlUsername) {
		this.mlUsername = mlUsername;
	}
	public String getMlPassword() {
		return mlPassword;
	}
	public void setMlPassword(String mlPassword) {
		this.mlPassword = mlPassword;
	}
	public boolean isServerValidated() {
		return serverValidated;
	}
	public void setServerValidated(boolean serverValidated) {
		this.serverValidated = serverValidated;
	}
	public boolean isServerAcceptable() {
		return serverAcceptable;
	}
	public void setServerAcceptable(boolean serverAcceptable) {
		this.serverAcceptable = serverAcceptable;
	}
	public boolean isInstalled() {
		return installed;
	}
	public void setInstalled(boolean installed) {
		this.installed = installed;
	}
	public boolean isValidServer() {
		return validServer;
	}
	public void setValidServer(boolean validServer) {
		this.validServer = validServer;
	}
	
}
