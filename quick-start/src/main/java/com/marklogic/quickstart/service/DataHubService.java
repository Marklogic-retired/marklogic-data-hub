/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.quickstart.service;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.CantUpgradeException;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.util.PerformanceLogger;
import com.marklogic.hub.validate.EntitiesValidator;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.exception.DataHubException;
import com.marklogic.quickstart.listeners.DeployUserModulesListener;
import com.marklogic.quickstart.listeners.ValidateListener;
import com.marklogic.quickstart.model.EnvironmentConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class DataHubService {

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public boolean install(HubConfig config, HubDeployStatusListener listener) throws DataHubException {
        logger.info("Installing Data Hub");
        DataHub dataHub = DataHub.create(config);
        try {
            dataHub.install(listener);
            return true;
        } catch(Throwable e) {
            e.printStackTrace();
            listener.onStatusChange(100, getStackTrace(e));
        }
        return false;
    }

    public void updateIndexes(HubConfig config) {
        DataHub dataHub = DataHub.create(config);
        try {
            dataHub.updateIndexes();
        } catch(Throwable e) {
            e.printStackTrace();
        }
    }
    private String getStackTrace(final Throwable throwable) {
        final StringWriter sw = new StringWriter();
        final PrintWriter pw = new PrintWriter(sw, true);
        throwable.printStackTrace(pw);
        return sw.getBuffer().toString();
    }

    @Async
    public void installUserModulesAsync(HubConfig config, boolean forceLoad, DeployUserModulesListener deployListener, ValidateListener validateListener) {
        installUserModules(config, forceLoad, deployListener, validateListener);
    }

    public void installUserModules(HubConfig config, boolean forceLoad, DeployUserModulesListener deployListener, ValidateListener validateListener) {
        long startTime = PerformanceLogger.monitorTimeInsideMethod();

        try {
            installUserModules(config, forceLoad, deployListener);
            validateUserModules(config, validateListener);
        } catch (Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
        PerformanceLogger.logTimeInsideMethod(startTime, "DataHubService.installUserModules");
    }

    @Async
    public void reinstallUserModules(HubConfig config, DeployUserModulesListener deployListener, ValidateListener validateListener) {
        long startTime = PerformanceLogger.monitorTimeInsideMethod();

        DataHub dataHub = DataHub.create(config);
        try {
            dataHub.clearUserModules();
            installUserModules(config, true, deployListener);
            validateUserModules(config, validateListener);
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
        PerformanceLogger.logTimeInsideMethod(startTime, "DataHubService.reinstallUserModules");

    }

    @Async
    public void uninstallUserModules(HubConfig config) {
        long startTime = PerformanceLogger.monitorTimeInsideMethod();

        DataHub dataHub = DataHub.create(config);
        try {
            dataHub.clearUserModules();
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
        PerformanceLogger.logTimeInsideMethod(startTime, "DataHubService.uninstallUserModules");
    }

    public HashMap preInstallCheck(HubConfig config) {
        DataHub dataHub = DataHub.create(config);
        return dataHub.runPreInstallCheck();
    }

    @Async
    public void validateUserModules(HubConfig hubConfig, ValidateListener validateListener) {
        EntitiesValidator ev = EntitiesValidator.create(hubConfig.newStagingManageClient());
        validateListener.onValidate(ev.validateAll());

    }

    public void uninstall(HubConfig config, HubDeployStatusListener listener) throws DataHubException {
        DataHub dataHub = DataHub.create(config);
        try {
            dataHub.uninstall(listener);
        } catch(Throwable e) {
            e.printStackTrace();
            throw new DataHubException(e.getMessage(), e);
        }
    }

    public String getLastDeployed(HubConfig config) {
        File tsFile = new File(config.getUserModulesDeployTimestampFile());
        Date lastModified = new Date(tsFile.lastModified());

        TimeZone tz = TimeZone.getTimeZone("UTC");
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
        df.setTimeZone(tz);

        return "{\"deployed\":" + tsFile.exists() + ", \"lastModified\":\"" + df.format(lastModified) + "\"}";
    }

    public boolean updateHub(HubConfig config) throws IOException, CantUpgradeException {
        boolean result = DataHub.create(config).upgradeHub();
        if (result) {
            ConnectionAuthenticationToken authenticationToken = (ConnectionAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if (authenticationToken != null) {
                EnvironmentConfig environmentConfig = authenticationToken.getEnvironmentConfig();
                environmentConfig.checkIfInstalled();
            }
        }
        return result;

    }

    public void clearContent(HubConfig config, String database) {
        DataHub dataHub = DataHub.create(config);
        dataHub.clearDatabase(database);
    }

    private void installUserModules(HubConfig hubConfig, boolean forceLoad, DeployUserModulesListener deployListener) {
        List<Command> commands = new ArrayList<>();
        LoadUserModulesCommand loadUserModulesCommand = new LoadUserModulesCommand(hubConfig);
        loadUserModulesCommand.setForceLoad(forceLoad);
        commands.add(loadUserModulesCommand);

        SimpleAppDeployer deployer = new SimpleAppDeployer(((HubConfigImpl)hubConfig).getManageClient(), ((HubConfigImpl)hubConfig).getAdminManager());
        deployer.setCommands(commands);
        deployer.deploy(hubConfig.getAppConfig());

        deployListener.onDeploy(getLastDeployed(hubConfig));
    }
}
