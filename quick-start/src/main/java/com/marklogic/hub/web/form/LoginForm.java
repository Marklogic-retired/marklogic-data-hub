package com.marklogic.hub.web.form;


public class LoginForm extends BaseForm {
	
    private String mlHost;
    private String mlRestPort;
    private String mlUsername;
    private String mlPassword;
    private boolean serverVersionAccepted;
    private boolean installed;
    private boolean skipLogin;
    
    public String getMlHost() {
        return mlHost;
    }

    public void setMlHost(String mlHost) {
        this.mlHost = mlHost;
    }

    public String getMlRestPort() {
        return mlRestPort;
    }

    public void setMlRestPort(String restPort) {
        this.mlRestPort = restPort;
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

    public boolean isServerVersionAccepted() {
        return serverVersionAccepted;
    }
    
    public void setServerVersionAccepted(boolean serverVersionAccepted) {
        this.serverVersionAccepted = serverVersionAccepted;
    }

    public boolean isInstalled() {
        return installed;
    }

    public void setInstalled(boolean installed) {
        this.installed = installed;
    }

	public boolean isSkipLogin() {
		return skipLogin;
	}

	public void setSkipLogin(boolean skipLogin) {
		this.skipLogin = skipLogin;
	}
    
    
}
