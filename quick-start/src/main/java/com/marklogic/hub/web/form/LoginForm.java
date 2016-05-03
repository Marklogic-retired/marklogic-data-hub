package com.marklogic.hub.web.form;

import java.util.ArrayList;
import java.util.List;

import com.marklogic.hub.model.EntityModel;

public class LoginForm extends BaseForm {

	private String mlHost;
	private String mlStagingPort;
	private String mlFinalPort;
	private String mlTracePort;
	private String mlUsername;
	private String mlPassword;
	private String userPluginDir;
	private boolean serverVersionAccepted;
	private boolean installed;
	private boolean loggedIn;
    private List<EntityModel> entities = new ArrayList<EntityModel>();
    private EntityModel selectedEntity;

	public String getMlHost() {
		return mlHost;
	}

	public void setMlHost(String mlHost) {
		this.mlHost = mlHost;
	}

	public String getMlStagingPort() {
        return mlStagingPort;
    }

    public void setMlStagingPort(String mlStagingPort) {
        this.mlStagingPort = mlStagingPort;
    }

    public String getMlFinalPort() {
        return mlFinalPort;
    }

    public void setMlFinalPort(String mlFinalPort) {
        this.mlFinalPort = mlFinalPort;
    }

    public String getMlTracePort() {
        return mlTracePort;
    }

    public void setMlTracePort(String mlTracePort) {
        this.mlTracePort = mlTracePort;
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

	public boolean isLoggedIn() {
		return loggedIn;
	}

	public void setLoggedIn(boolean loggedIn) {
		this.loggedIn = loggedIn;
	}

	public String getUserPluginDir() {
		return userPluginDir;
	}

	public void setUserPluginDir(String userPluginDir) {
		this.userPluginDir = userPluginDir;
	}

    public List<EntityModel> getEntities() {
        return entities;
    }

    public void setEntities(List<EntityModel> entities) {
        this.entities = entities;
    }

    public EntityModel getSelectedEntity() {
        return selectedEntity;
    }

    public void setSelectedEntity(EntityModel selectedEntity) {
        this.selectedEntity = selectedEntity;
    }

    public void selectEntity(String entityName) {
        if (entities != null) {
            for (EntityModel entity : entities) {
                if (entity.getEntityName().equals(entityName)) {
                    setSelectedEntity(entity);
	                return;
	            }
	        }
	    }
	}

    public void refreshSelectedEntity() {
        if (selectedEntity != null) {
            selectEntity(selectedEntity.getEntityName());
	    }
	}
}
