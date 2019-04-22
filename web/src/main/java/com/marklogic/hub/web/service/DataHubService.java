/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.web.service;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.LoadHubArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadUserArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.CantUpgradeException;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.util.PerformanceLogger;
import com.marklogic.hub.validate.EntitiesValidator;
import com.marklogic.hub.web.auth.ConnectionAuthenticationToken;
import com.marklogic.hub.web.exception.DataHubException;
import com.marklogic.hub.web.listeners.DeployUserModulesListener;
import com.marklogic.hub.web.listeners.ValidateListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private DataHub dataHub;

    @Autowired
    private LoadUserModulesCommand loadUserModulesCommand;

    @Autowired
    private LoadUserArtifactsCommand loadUserArtifactsCommand;

    @Autowired
    private LoadHubArtifactsCommand loadHubArtifactsCommand;

    public boolean install(HubConfig config, HubDeployStatusListener listener) throws DataHubException {
        logger.info("Installing Data Hub");
        try {
            dataHub.install(listener);
            return true;
        } catch(Throwable e) {
            e.printStackTrace();
            listener.onStatusChange(-1, getStackTrace(e));
        }
        return false;
    }

    public void updateIndexes(HubConfig config) {
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

    @Async
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

        try {
            dataHub.clearUserModules();
            installUserModules(config, true, deployListener);
            if(validateListener != null) {
                validateUserModules(config, validateListener);
            }
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
        PerformanceLogger.logTimeInsideMethod(startTime, "DataHubService.reinstallUserModules");

    }

    @Async
    public void uninstallUserModules(HubConfig config) {
        long startTime = PerformanceLogger.monitorTimeInsideMethod();

        try {
            dataHub.clearUserModules();
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
        PerformanceLogger.logTimeInsideMethod(startTime, "DataHubService.uninstallUserModules");
    }

    public HashMap preInstallCheck(HubConfig config) {
        return dataHub.runPreInstallCheck();
    }

    @Async
    public void validateUserModules(HubConfig hubConfig, ValidateListener validateListener) {
        EntitiesValidator ev = EntitiesValidator.create(hubConfig.newStagingClient());
        validateListener.onValidate(ev.validateAll());

    }

    public void uninstall(HubConfig config, HubDeployStatusListener listener) throws DataHubException {
        try {
            dataHub.uninstall(listener);
        } catch(Throwable e) {
            e.printStackTrace();
            throw new DataHubException(e.getMessage(), e);
        }
    }

    public String getLastDeployed(HubConfig config) {
        File tsFile = new File(config.getHubProject().getUserModulesDeployTimestampFile());
        Date lastModified = new Date(tsFile.lastModified());

        TimeZone tz = TimeZone.getTimeZone("UTC");
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
        df.setTimeZone(tz);

        return "{\"deployed\":" + tsFile.exists() + ", \"lastModified\":\"" + df.format(lastModified) + "\"}";
    }

    public boolean updateHub(HubConfig config) throws IOException, CantUpgradeException {
        boolean result = dataHub.upgradeHub();
        if (result) {
            ConnectionAuthenticationToken authenticationToken = (ConnectionAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        }
        return result;

    }

    public void clearContent(HubConfig config, String database) {
        dataHub.clearDatabase(database);
    }

    private void installUserModules(HubConfig hubConfig, boolean forceLoad, DeployUserModulesListener deployListener) {
        List<Command> commands = new ArrayList<>();
        loadUserModulesCommand.setHubConfig(hubConfig);
        loadUserModulesCommand.setForceLoad(forceLoad);

        loadUserArtifactsCommand.setHubConfig(hubConfig);
        loadUserArtifactsCommand.setForceLoad(forceLoad);

        loadHubArtifactsCommand.setHubConfig(hubConfig);
        loadHubArtifactsCommand.setForceLoad(forceLoad);

        commands.add(loadUserModulesCommand);
        commands.add(loadUserArtifactsCommand);
        commands.add(loadHubArtifactsCommand);

        SimpleAppDeployer deployer = new SimpleAppDeployer(((HubConfigImpl)hubConfig).getManageClient(), ((HubConfigImpl)hubConfig).getAdminManager());
        deployer.setCommands(commands);
        deployer.deploy(hubConfig.getAppConfig());
        if(deployListener != null) {
            deployListener.onDeploy(getLastDeployed(hubConfig));
        }
    }
}
