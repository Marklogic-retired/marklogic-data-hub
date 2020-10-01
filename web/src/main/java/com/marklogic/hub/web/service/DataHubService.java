/*
 * Copyright (c) 2020 MarkLogic Corporation
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
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.GenerateFunctionMetadataCommand;
import com.marklogic.hub.deploy.commands.LoadHubArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadUserArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.legacy.validate.EntitiesValidator;
import com.marklogic.hub.util.PerformanceLogger;
import com.marklogic.hub.web.exception.DataHubException;
import com.marklogic.hub.web.listeners.DeployUserModulesListener;
import com.marklogic.hub.web.listeners.ValidateListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
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

    @Autowired
    private GenerateFunctionMetadataCommand generateFunctionMetadataCommand;

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
        logger.info("Installing user modules");
        long startTime = PerformanceLogger.monitorTimeInsideMethod();
        try {
            installUserModules(config, forceLoad, deployListener);
            if (validateListener != null) {
                validateUserModules(config, validateListener);
            }
        } catch (Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
        PerformanceLogger.logTimeInsideMethod(startTime, "DataHubService.installUserModules");
    }

    @Async
    public void reinstallUserModules(HubConfig config, DeployUserModulesListener deployListener, ValidateListener validateListener) {
        logger.info("Reinstalling user modules");
        long startTime = PerformanceLogger.monitorTimeInsideMethod();
        try {
            dataHub.clearUserModules();
            installUserModules(config, true, deployListener, validateListener);
        } catch(Throwable e) {
            throw new DataHubException(e.getMessage(), e);
        }
        PerformanceLogger.logTimeInsideMethod(startTime, "DataHubService.reinstallUserModules");
    }

    public void deleteDocument(String uri, DatabaseKind databaseKind) {
        dataHub.deleteDocument(uri, databaseKind);
    }

    public Map<String, Object> preInstallCheck(HubConfig config) {
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

    public void clearContent(HubConfig config, String database) {
        dataHub.clearDatabase(database);
    }

    protected void installUserModules(HubConfig hubConfig, boolean forceLoad, DeployUserModulesListener deployListener) {
        List<Command> commands = new ArrayList<>();
        loadUserModulesCommand.setHubConfig(hubConfig);
        loadUserModulesCommand.setForceLoad(forceLoad);

        loadUserArtifactsCommand.setHubConfig(hubConfig);
        loadUserArtifactsCommand.setForceLoad(forceLoad);

        // TODO Why load hub artifacts when this method is for loading user modules/artifacts?
        loadHubArtifactsCommand.setHubConfig(hubConfig);

        // Generating function metadata xslt causes running existing mapping (xslts) step to fail with undefined function
        // for any mappings that use these functions. So, we have to generate function metadata xslt only when 'forceLoad'
        // is set to true which would ensure that mappings are inserted and compiled to xslts as well.
        // Added as a temporary fix for DHFPROD-3606.
        if(forceLoad){
            commands.add(generateFunctionMetadataCommand);
        }
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
