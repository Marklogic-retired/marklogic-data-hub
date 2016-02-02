package com.marklogic.hub.web.form;

public class DeploymentForm {
    private String mlHost;
    private String mlRestPort;
    private String mlUsername;
    private String mlPassword;
    private boolean serverValidated;
    private boolean serverAcceptable;
    private boolean installed;
    private boolean canBeDeployed;

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

    public boolean isCanBeDeployed() {
        return canBeDeployed;
    }

    public void setCanBeDeployed(boolean canBeDeployed) {
        this.canBeDeployed = canBeDeployed;
    }

}
