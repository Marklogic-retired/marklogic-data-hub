package com.marklogic.hub.service;

import java.io.File;
import java.util.Date;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.marklogic.hub.DataHub;
import com.marklogic.hub.ServerValidationException;
import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.exception.DataHubException;

@Service
public class DataHubService {

	private static final Logger LOGGER = LoggerFactory.getLogger(DataHubService.class);

	@Autowired
	private EnvironmentConfiguration environmentConfiguration;

	public void install() throws DataHubException {
		DataHub dataHub = getDataHub();
		try {
			dataHub.install();
		} catch(Throwable e) {
			throw new DataHubException(e.getMessage(), e);
		}
	}

    public Map<File, Date> installUserModules() throws DataHubException {
        DataHub dataHub = getDataHub();
        try {
            return dataHub.installUserModules(environmentConfiguration.getUserPluginDir());
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
    }

	private DataHub getDataHub() throws DataHubException {
		try {
            LOGGER.info("Connecting to DataHub at host is {}:{} with user={}",
                    new Object[] {
                            environmentConfiguration.getMLHost()
                            ,environmentConfiguration.getMLRestPort()
                            ,environmentConfiguration.getMLUsername()
                            });
            DataHub dataHub = new DataHub(environmentConfiguration.getMLHost(), Integer.parseInt(environmentConfiguration.getMLRestPort()), environmentConfiguration.getMLUsername(),
                    environmentConfiguration.getMLPassword());
            dataHub.setAssetInstallTimeFile(new File(environmentConfiguration.getAssetInstallTimeFilePath()));
            
            return dataHub;
		} catch(Throwable e) {
			throw new DataHubException(e.getMessage(), e);
		}
	}

	public boolean isInstalled() throws DataHubException {
		DataHub dataHub = getDataHub();
		try {
			return dataHub.isInstalled();
		} catch(Throwable e) {
			throw new DataHubException(e.getMessage(), e);
		}
	}

	public boolean isServerAcceptable() throws DataHubException {
		DataHub dataHub = getDataHub();
		try {
			dataHub.validateServer();
			return true;
		} catch(ServerValidationException exception) {
			return false;
		} catch(Throwable e) {
			throw new DataHubException(e.getMessage(), e);
		}
	}

	public void uninstall() throws DataHubException {
		DataHub dataHub = getDataHub();
		try {
			dataHub.uninstall();
		} catch(Throwable e) {
			throw new DataHubException(e.getMessage(), e);
		}
    }
	
	

}
