/*
 * Copyright 2012-2016 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.quickstart.service;

import com.marklogic.client.helper.LoggingObject;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.util.PerformanceLogger;
import com.marklogic.quickstart.exception.DataHubException;
import com.marklogic.quickstart.listeners.DeployUserModulesListener;
import com.marklogic.quickstart.listeners.ValidateListener;
import org.apache.commons.io.FileUtils;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.*;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Properties;
import java.util.TimeZone;
import java.util.regex.Pattern;

@Service
public class DataHubService extends LoggingObject {

    public boolean install(HubConfig config, HubDeployStatusListener listener) throws DataHubException {
        logger.info("Installing Data Hub");
        DataHub dataHub = new DataHub(config);
        try {
            dataHub.install(listener);
            return true;
        } catch(Throwable e) {
            e.printStackTrace();
            listener.onStatusChange(100, getStackTrace(e));
        }
        return false;
    }

    private String getStackTrace(final Throwable throwable) {
        final StringWriter sw = new StringWriter();
        final PrintWriter pw = new PrintWriter(sw, true);
        throwable.printStackTrace(pw);
        return sw.getBuffer().toString();
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


    public void uninstall(HubConfig config, HubDeployStatusListener listener) throws DataHubException {
        DataHub dataHub = new DataHub(config);
        try {
            dataHub.uninstall(listener);
        } catch(Throwable e) {
            e.printStackTrace();
            throw new DataHubException(e.getMessage(), e);
        }
    }

    public String getLastDeployed(HubConfig config) {
        File tsFile = Paths.get(config.projectDir, ".tmp", LoadUserModulesCommand.USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES).toFile();
        Date lastModified = new Date(tsFile.lastModified());

        TimeZone tz = TimeZone.getTimeZone("UTC");
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
        df.setTimeZone(tz);

        return "{\"deployed\":" + tsFile.exists() + ", \"lastModified\":\"" + df.format(lastModified) + "\"}";
    }

    private String getQuickStartVersion() throws IOException {
        Properties properties = new Properties();
        InputStream inputStream = getClass().getClassLoader().getResourceAsStream("quickstart-version.properties");
        properties.load(inputStream);
        return (String)properties.get("version");
    }

    public String getHubVersions(HubConfig config) throws IOException {
        String quickstartVersion = getQuickStartVersion();

        DataHub dataHub = new DataHub(config);
        String versions = "{\"installedVersion\":\"" + dataHub.getHubVersion() + "\", \"quickstartVersion\":\"" + quickstartVersion + "\"}";
        return versions;
    }

    public boolean updateHub(HubConfig config) {
        boolean result = false;
        File buildGradle = Paths.get(config.projectDir, "build.gradle").toFile();
        try {
            String quickstartVersion = getQuickStartVersion();
            String text = new String(FileCopyUtils.copyToByteArray(buildGradle));
            text = Pattern.compile("^(\\s*)id\\s+['\"]com.marklogic.ml-data-hub['\"]\\s+version.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1id 'com.marklogic.ml-data-hub' version '" + quickstartVersion + "'");
            text = Pattern.compile("^(\\s*)compile.+marklogic-data-hub.+$", Pattern.MULTILINE).matcher(text).replaceAll("$1compile 'com.marklogic:marklogic-data-hub:" + quickstartVersion + "'");
            FileUtils.writeStringToFile(buildGradle, text);

            DataHub dataHub = new DataHub(config);
            dataHub.installHubModules();

            result = true;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return result;
    }

    public void clearContent(HubConfig config, String database) {
        DataHub dataHub = new DataHub(config);
        dataHub.clearContent(database);
    }

    private void installUserModules(HubConfig config, DataHub dataHub, boolean forceLoad, DeployUserModulesListener deployListener) {
        dataHub.installUserModules(forceLoad);
        deployListener.onDeploy(getLastDeployed(config));
    }

    private void validateUserModules(DataHub dataHub, ValidateListener validateListener) {
        validateListener.onValidate(dataHub.validateUserModules());
    }
}
