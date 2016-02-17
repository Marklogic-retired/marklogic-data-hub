package com.marklogic.hub.web.bean;

import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

import javax.annotation.ManagedBean;

import org.springframework.context.annotation.Scope;
import org.springframework.web.context.WebApplicationContext;

@ManagedBean
@Scope(scopeName=WebApplicationContext.SCOPE_SESSION)
public class SyncStatusBean {
    private Set<String> modifiedDomains = Collections.synchronizedSet(new LinkedHashSet<>());
    private Map<String, Set<String>> modifiedInputFlows = Collections.synchronizedMap(new HashMap<>());
    private Map<String, Set<String>> modifiedConformFlows = Collections.synchronizedMap(new HashMap<>());
    
    public Set<String> getModifiedDomains() {
        return modifiedDomains;
    }
    
    public void addModifiedDomain(String domain) {
        modifiedDomains.add(domain);
    }
    
    public Map<String, Set<String>> getModifiedInputFlows() {
        return modifiedInputFlows;
    }
    
    public void addModifiedInputFlow(String domain, String flow) {
        synchronized (modifiedInputFlows) {
            Set<String> domainFlows = modifiedInputFlows.get(domain);
            if (domainFlows == null) {
                domainFlows = new LinkedHashSet<>();
                modifiedInputFlows.put(domain, domainFlows);
            }
            
            domainFlows.add(flow);
        }
    }
    
    public Map<String, Set<String>> getModifiedConformFlows() {
        return modifiedConformFlows;
    }
    
    public void addModifiedConformFlow(String domain, String flow) {
        synchronized (modifiedConformFlows) {
            Set<String> domainFlows = modifiedConformFlows.get(domain);
            if (domainFlows == null) {
                domainFlows = new LinkedHashSet<>();
                modifiedConformFlows.put(domain, domainFlows);
            }
            
            domainFlows.add(flow);
        }
    }

    public void clearModifications() {
        modifiedDomains.clear();
        modifiedInputFlows.clear();
        modifiedConformFlows.clear();
    }
}
