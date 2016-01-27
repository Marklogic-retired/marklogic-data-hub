package com.marklogic.hub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.marklogic.hub.DataHub;
import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.web.controller.MainPageController;

@Service
public class DataHubService {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(MainPageController.class);
	
	@Autowired
	private EnvironmentConfiguration environmentConfiguration;
	
	private DataHub dataHub;
	
	public void deployToMarkLogic() {
		LOGGER.info("Host is "+environmentConfiguration.getMLHost());
		LOGGER.info("username is "+environmentConfiguration.getMLUserName());
		LOGGER.info("password is "+environmentConfiguration.getMLPassword());
		//dataHub = new DataHub(environmentConfiguration.getMLHost(), environmentConfiguration.getMLUserName(), 
			//	environmentConfiguration.getMLPassword());
	}
	
	public boolean isInstalled() {
		return dataHub.isInstalled();
	}

}
