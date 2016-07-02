package com.marklogic.quickstart.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.StatusListener;
import com.marklogic.quickstart.exception.DataHubException;
import com.marklogic.quickstart.model.EnvironmentConfig;

@Service
@Scope("session")
public class DataHubService {

    private static final Logger logger = LoggerFactory.getLogger(DataHubService.class);

    @Autowired
    private EnvironmentConfig environmentConfiguration;

    @Async
    public void install(HubConfig config, StatusListener listener) throws DataHubException {
        logger.info("Installing Data Hub");
        DataHub dataHub = new DataHub(config);
        try {
            dataHub.install(listener);
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
    }

    @Async
    public void installUserModules() {
        DataHub dataHub = getDataHub();
        try {
            dataHub.installUserModules();
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
    }

//    public JsonNode validateUserModules() {
//        DataHub dataHub = getDataHub();
//        return dataHub.validateUserModules();
//    }

    public DataHub getDataHub() throws DataHubException {
        return new DataHub(environmentConfiguration.mlSettings);
    }

//    public boolean isServerAcceptable() throws DataHubException {
//        DataHub dataHub = getDataHub();
//        try {
//            dataHub.validateServer();
//            return true;
//        } catch(ServerValidationException exception) {
//            return false;
//        } catch(Throwable e) {
//            throw new DataHubException(e.getMessage(), e);
//        }
//    }

    @Async
    public void uninstall(HubConfig config, StatusListener listener) throws DataHubException {
        DataHub dataHub = new DataHub(config);
        try {
            dataHub.uninstall(listener);
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
    }



}
