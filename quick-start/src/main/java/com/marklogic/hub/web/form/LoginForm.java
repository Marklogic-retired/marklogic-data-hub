package com.marklogic.hub.web.form;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.marklogic.hub.factory.DomainModelFactory;
import com.marklogic.hub.model.DomainModel;
import com.marklogic.hub.model.FlowModel;
import com.marklogic.hub.web.bean.SyncStatusBean;

public class LoginForm extends BaseForm {

	private String mlHost;
	private String mlRestPort;
	private String mlUsername;
	private String mlPassword;
	private String userPluginDir;
	private boolean serverVersionAccepted;
	private boolean installed;
	private boolean loggedIn;
    private List<DomainModel> domains = new ArrayList<DomainModel>();
	private DomainModel selectedDomain;

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

	public List<DomainModel> getDomains() {
		return domains;
	}

	public void setDomains(List<DomainModel> domains) {
		this.domains = domains;
	}
	
	public void refreshDomains(List<DomainModel> domains) {
	    Map<String, DomainModel> domainMap = DomainModelFactory.toDomainModelMap(this.domains);
	    Map<String, DomainModel> newDomainMap = DomainModelFactory.toDomainModelMap(domains);
	    
	    for (DomainModel model : domains) {
	        DomainModel oldModel = domainMap.get(model.getDomainName());
	        model.copySyncStatusFrom(oldModel);
	    }
	    
	    if (selectedDomain != null) {
	        DomainModel oldModel = domainMap.get(selectedDomain.getDomainName());
	        DomainModel newDomainModel = newDomainMap.get(selectedDomain.getDomainName());
	        if (newDomainModel != null) {
	            newDomainModel.copySyncStatusFrom(oldModel);
	            selectedDomain = newDomainModel;
	        }
	    }
	    
	    this.domains = domains;
	}
	
	public void updateWithSyncStatus(SyncStatusBean syncStatus) {
	    updateModifiedDomains(syncStatus.getModifiedDomains());
	    updateModifiedInputFlows(syncStatus.getModifiedInputFlows());
	    updateModifiedConformFlows(syncStatus.getModifiedConformFlows());
	}
	
	public void updateModifiedDomains(Set<String> modifiedDomains) {
	    if (modifiedDomains.isEmpty()) {
	        return;
	    }

	    for (DomainModel domainModel : domains) {
	        if (modifiedDomains.contains(domainModel.getDomainName())) {
	            domainModel.setSynched(false);
	        }
	    }

	    if (selectedDomain != null) {
	        if (modifiedDomains.contains(selectedDomain.getDomainName())) {
	            selectedDomain.setSynched(false);
	        }
	    }
	}
	
	public void updateModifiedInputFlows(Map<String, Set<String>> modifiedInputFlows) {
	    if (modifiedInputFlows.isEmpty()) {
	        return;
	    }
	    
	    for (DomainModel domainModel : domains) {
	        Set<String> modifiedFlows = modifiedInputFlows.get(domainModel.getDomainName());
	        if (modifiedFlows == null || modifiedFlows.isEmpty()) {
	            continue;
	        }
	        
	        List<FlowModel> flowList = domainModel.getInputFlows();
	        if (flowList == null || flowList.isEmpty()) {
	            continue;
	        }
	        
	        for (FlowModel flow : flowList) {
	            if (modifiedFlows.contains(flow.getFlowName())) {
	                flow.setSynched(false);
	            }
	        }
	    }
	}
	
	public void updateModifiedConformFlows(Map<String, Set<String>> modifiedConformFlows) {
	    if (modifiedConformFlows.isEmpty()) {
            return;
        }
        
        for (DomainModel domainModel : domains) {
            Set<String> modifiedFlows = modifiedConformFlows.get(domainModel.getDomainName());
            if (modifiedFlows == null || modifiedFlows.isEmpty()) {
                continue;
            }
            
            List<FlowModel> flowList = domainModel.getConformFlows();
            if (flowList == null || flowList.isEmpty()) {
                continue;
            }
            
            for (FlowModel flow : flowList) {
                if (modifiedFlows.contains(flow.getFlowName())) {
                    flow.setSynched(false);
                }
            }
        }
	}

	public DomainModel getSelectedDomain() {
		return selectedDomain;
	}

	public void setSelectedDomain(DomainModel selectedDomain) {
		this.selectedDomain = selectedDomain;
	}

	public void selectDomain(String domainName) {
	    if (domains != null) {
	        for (DomainModel domain : domains) {
	            if (domain.getDomainName().equals(domainName)) {
	                setSelectedDomain(domain);
	            }
	        }
	    }
	}
}
