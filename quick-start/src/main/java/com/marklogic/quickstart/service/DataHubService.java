package com.marklogic.quickstart.service;

import com.marklogic.client.helper.LoggingObject;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.StatusListener;
import com.marklogic.hub.util.PerformanceLogger;
import com.marklogic.quickstart.exception.DataHubException;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class DataHubService extends LoggingObject {

    public boolean install(HubConfig config, StatusListener listener) throws DataHubException {
        logger.info("Installing Data Hub");
        DataHub dataHub = new DataHub(config);
        try {
            dataHub.install(listener);
            return true;
        } catch(Throwable e) {
            listener.onStatusChange(100, ExceptionUtils.getStackTrace(e));
        }
        return false;
    }

    @Async
    public void installUserModules(HubConfig config, boolean forceLoad) {
        long startTime = PerformanceLogger.monitorTimeInsideMethod();

        DataHub dataHub = new DataHub(config);
        try {
            dataHub.installUserModules(forceLoad);
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
        PerformanceLogger.logTimeInsideMethod(startTime, "DataHubService.installUserModules");
    }

//    public JsonNode validateUserModules() {
//        DataHub dataHub = getDataHub();
//        return dataHub.validateUserModules();
//    }

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


    public void uninstall(HubConfig config, StatusListener listener) throws DataHubException {
        DataHub dataHub = new DataHub(config);
        try {
            dataHub.uninstall(listener);
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
    }



}
