package com.marklogic.hub.service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.hub.DomainManager;
import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.domain.Domain;
import com.marklogic.hub.factory.DomainModelFactory;
import com.marklogic.hub.model.DomainModel;
import com.marklogic.hub.util.FileUtil;

@Service
public class DomainManagerService {

	private static final Logger LOGGER = LoggerFactory
			.getLogger(DomainManagerService.class);

	@Autowired
	private EnvironmentConfiguration environmentConfiguration;

	public DomainManager getDomainManager() {

		Authentication authMethod = Authentication
				.valueOf(environmentConfiguration.getMLAuth().toUpperCase());
		DatabaseClient client = DatabaseClientFactory.newClient(
				environmentConfiguration.getMLHost(),
				Integer.parseInt(environmentConfiguration.getMLRestPort()),
				environmentConfiguration.getMLUsername(),
				environmentConfiguration.getMLPassword(), authMethod);
		return new DomainManager(client);

	}

	public List<DomainModel> getDomains() {
		List<DomainModel> domains = new ArrayList<>();
		DomainManager domainManager = getDomainManager();
		List<Domain> domainsInServer = domainManager.getDomains();
		List<String> domainNames = FileUtil
				.listDirectFolders(environmentConfiguration.getUserPluginDir());
		DomainModelFactory domainModelFactory = new DomainModelFactory(
				domainsInServer);
		for (String domainName : domainNames) {
			LOGGER.debug("Domain : " + domainName);
			domains.add(domainModelFactory.createDomain(domainName,
					environmentConfiguration.getUserPluginDir()
							+ File.separator + domainName));
		}
		return domains;
	}

	public Domain getDomain(String domainName) {
		DomainManager domainManager = getDomainManager();
		return domainManager.getDomain(domainName);
	}
}
