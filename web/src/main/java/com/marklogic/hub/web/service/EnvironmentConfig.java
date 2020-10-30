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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.InstallInfo;
import com.marklogic.hub.impl.Versions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EnvironmentConfig {

    private String projectDir;
    private String environment;

    private InstallInfo installInfo;
    private boolean isInitialized = false;

    @Autowired
    private DataHub dataHub;

    @Autowired
    private HubConfig mlSettings;

    @JsonIgnore
    @Autowired
    private Versions versions;

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

    @JsonIgnore
    public void checkIfInstalled() {
        projectDir = mlSettings.getHubProject().getProjectDirString();
        this.installInfo = dataHub.isInstalled();
        // As of 5.3.0, per DHFPROD-4912, we want this to fallback to the local project if the version can't be
        // determined from an installed DH (likely because DH is not yet installed)
        this.installedVersion = versions.getInstalledVersion(true);
        this.marklogicVersion = versions.getMarkLogicVersionString();
        this.runningVersion = this.mlSettings.getJarVersion();
        // The references in QS to "dhfversion" cannot be removed via DHFPROD-4912, as QS is unfortunately tightly
        // bound to this value. So we need something here. The new getLocalProjectVersion concept in 5.3 will work,
        // with the one caveat being that if it cannot be identified, then 2.0.0 is used as a fallback, and QS likely
        // does not want to display that to the user.
        this.DHFVersion = versions.getLocalProjectVersion();

        // Replace "-SNAPSHOT" in version with ".0" as QS compares versions and fails if version number contains text
        installedVersion = installedVersion.replace("-SNAPSHOT", ".0");
        runningVersion = runningVersion.replace("-SNAPSHOT", ".0");
        DHFVersion = DHFVersion.replace("-SNAPSHOT", ".0");
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
