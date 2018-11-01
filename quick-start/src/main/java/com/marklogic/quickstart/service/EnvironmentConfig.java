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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.InstallInfo;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import com.marklogic.hub.impl.Versions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EnvironmentConfig {

    private String projectDir;
    private String environment;

    private InstallInfo installInfo;
    private boolean isInitialized = false;

    private HubConfig mlSettings;

    @Autowired
    private DataHub dataHub;

    @Autowired
    private HubConfigImpl hubConfig;

    @Autowired
    private HubProjectImpl project;

    private String installedVersion;

    private String runningVersion;

    private String marklogicVersion;

    private String DHFVersion;

    public InstallInfo getInstallInfo() {
        return installInfo;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getProjectDir() {
        return projectDir;
    }

    public void setProjectDir(String projectDir) {
        this.projectDir = projectDir;
    }

    public boolean isInitialized() {
        return isInitialized;
    }

    public void setInitialized(boolean initialized) {
        isInitialized = initialized;
    }

    public HubConfig getMlSettings() {
        return mlSettings;
    }

    public void setMlSettings(HubConfig mlSettings) {
        this.mlSettings = mlSettings;
    }

    public String getMarklogicVersion() {
        return marklogicVersion;
    }

    public String getDHFVersion() {
        return DHFVersion;
    }

    public EnvironmentConfig() {

    }
    public EnvironmentConfig(String projectDir, String environment, String username, String password) {
        //FIXME this will prevent project switching?
        this.projectDir = projectDir;
        this.environment = environment;
        hubConfig.refreshProject();

        /*
        Properties overrides = new Properties();
        overrides.put("mlUsername", username);
        overrides.put("mlPassword", password);
        mlSettings = HubConfigBuilder.newHubConfigBuilder(this.projectDir)
            .withPropertiesFromEnvironment(environment)
            .withProperties(overrides)
            .build();
        if (username != null) {
            mlSettings.getStagingAppConfig().setAppServicesUsername(username);
            mlSettings.getStagingAppConfig().setAppServicesPassword(password);
        }
        dataHub = DataHub.create(mlSettings);
        */

    }

    @JsonIgnore
    public void checkIfInstalled() {
        this.installInfo = dataHub.isInstalled();
        //FIXME
        Versions versions = new Versions();
        this.installedVersion = versions.getHubVersion();
        this.marklogicVersion = versions.getMarkLogicVersion();
        this.runningVersion = this.mlSettings.getJarVersion();
        this.DHFVersion = versions.getDHFVersion();
    }

    private DatabaseClient _stagingClient = null;

    @JsonIgnore
    public DatabaseClient getStagingClient() {
        if (_stagingClient == null) {
            _stagingClient = mlSettings.newStagingClient();
        }
        return _stagingClient;
    }


    private DatabaseClient _finalClient = null;

    @JsonIgnore
    public DatabaseClient getFinalClient() {
        if (_finalClient == null) {
            _finalClient = mlSettings.newFinalClient();
        }
        return _finalClient;
    }

    @JsonIgnore
    public DatabaseClient getReverseFlowClient() {
        if (_finalClient == null) {
            _finalClient = mlSettings.newReverseFlowClient();
        }
        return _finalClient;
    }

    private DatabaseClient _jobClient = null;
    @JsonIgnore
    public DatabaseClient getJobClient() {
        if (_jobClient == null) {
            _jobClient = mlSettings.newJobDbClient();
        }
        return _jobClient;
    }

    public String getInstalledVersion() {
        return installedVersion;
    }

    public String getRunningVersion() {
        return runningVersion;
    }

    public String toJson() throws JsonProcessingException {
        ObjectMapper om = new ObjectMapper();
        return om.writeValueAsString(this);
    }
}
