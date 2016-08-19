package com.marklogic.quickstart.service;

import com.marklogic.client.helper.LoggingObject;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.StatusListener;
import com.marklogic.hub.commands.LoadUserModulesCommand;
import com.marklogic.hub.util.PerformanceLogger;
import com.marklogic.quickstart.exception.DataHubException;
import com.marklogic.quickstart.listeners.DeployUserModulesListener;
import com.marklogic.quickstart.listeners.ValidateListener;
import org.apache.commons.lang.exception.ExceptionUtils;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

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
    public void installUserModules(HubConfig config, boolean forceLoad, DeployUserModulesListener deployListener, ValidateListener validateListener) {
        long startTime = PerformanceLogger.monitorTimeInsideMethod();

        DataHub dataHub = new DataHub(config);
        try {
            installUserModules(config, dataHub, forceLoad, deployListener);
            validateUserModules(dataHub, validateListener);
        } catch (Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
        PerformanceLogger.logTimeInsideMethod(startTime, "DataHubService.installUserModules");
    }

    @Async
    public void reinstallUserModules(HubConfig config, DeployUserModulesListener deployListener, ValidateListener validateListener) {
        long startTime = PerformanceLogger.monitorTimeInsideMethod();

        DataHub dataHub = new DataHub(config);
        try {
            dataHub.clearUserModules();
            installUserModules(config, dataHub, true, deployListener);
            validateUserModules(dataHub, validateListener);
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
        PerformanceLogger.logTimeInsideMethod(startTime, "DataHubService.reinstallUserModules");

    }

    @Async
    public void uninstallUserModules(HubConfig config) {
        long startTime = PerformanceLogger.monitorTimeInsideMethod();

        DataHub dataHub = new DataHub(config);
        try {
            dataHub.clearUserModules();
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
        PerformanceLogger.logTimeInsideMethod(startTime, "DataHubService.uninstallUserModules");
    }

    @Async
    public void validateUserModules(HubConfig config, ValidateListener validateListener) {
        DataHub dataHub = new DataHub(config);
        validateUserModules(dataHub, validateListener);
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


    public void uninstall(HubConfig config, StatusListener listener) throws DataHubException {
        DataHub dataHub = new DataHub(config);
        try {
            dataHub.uninstall(listener);
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
    }

    public String getLastDeployed(HubConfig config) {
        File tsFile = Paths.get(config.projectDir, ".tmp", LoadUserModulesCommand.TIMESTAMP_FILE).toFile();
        Date lastModified = new Date(tsFile.lastModified());

        TimeZone tz = TimeZone.getTimeZone("UTC");
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
        df.setTimeZone(tz);

        return "{\"deployed\":true, \"lastModified\":\"" + df.format(lastModified) + "\"}";
    }

    private void installUserModules(HubConfig config, DataHub dataHub, boolean forceLoad, DeployUserModulesListener deployListener) {
        dataHub.installUserModules(forceLoad);
        deployListener.onDeploy(getLastDeployed(config));
    }

    private void validateUserModules(DataHub dataHub, ValidateListener validateListener) {
        validateListener.onValidate(dataHub.validateUserModules());
    }
}
