package com.marklogic.hub.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.hub.DomainManager;
import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.domain.Domain;

public class DomainManagerService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DomainManagerService.class);

    @Autowired
    private EnvironmentConfiguration environmentConfiguration;

    public DomainManager getDomainManager() {

        Authentication authMethod = Authentication.valueOf(environmentConfiguration.getMLAuth().toUpperCase());
        DatabaseClient client = DatabaseClientFactory.newClient(environmentConfiguration.getMLHost(),
                Integer.parseInt(environmentConfiguration.getMLRestPort()), environmentConfiguration.getMLUsername(), environmentConfiguration.getMLPassword(),
                authMethod);
        return new DomainManager(client);

    }

    public List<Domain> getDomains() {
        DomainManager domainManager = getDomainManager();
        return domainManager.getDomains();
    }

    public Domain getDomain(String domainName) {
        DomainManager domainManager = getDomainManager();
        return domainManager.getDomain(domainName);
    }
}
