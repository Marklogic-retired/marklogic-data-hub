package com.marklogic.hub.web.form;

public class LoginForm {
    private String mlHost;
    private String mlRestPort;
    private String mlUsername;
    private String mlPassword;
    private boolean loginAccepted;
    private boolean serverVersionAccepted;
    private boolean installed;

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
    
    public boolean isLoginAccepted() {
        return loginAccepted;
    }

    public void setLoginAccepted(boolean loginAccepted) {
        this.loginAccepted = loginAccepted;
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
}
