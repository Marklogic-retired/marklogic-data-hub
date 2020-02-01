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
package com.marklogic.hub.oneui.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.impl.Versions;
import com.marklogic.hub.oneui.models.HubConfigSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EnvironmentConfig {

    private String projectDir;
    private String projectName;
    private String dataHubVersion;
    private String marklogicVersion;
    private int stagingPort;
    private String host;

    @Autowired
    @JsonIgnore
    private HubConfigSession hubConfig;

    @Autowired
    @JsonIgnore
    private Versions versions;

    public String getMarklogicVersion() {
        return marklogicVersion;
    }

    public String getDataHubVersion() {
        return dataHubVersion;
    }

    public String getProjectDir() {
        return projectDir;
    }

    public String getProjectName() {
        return projectName;
    }

    public int getStagingPort() {
        return stagingPort;
    }

    public String getHost() {
        return host;
    }

    public void setProjectInfo() {
        HubProject hubProject = hubConfig.getHubProject();
        this.projectDir = hubProject.getProjectDir().toString();
        this.projectName = hubProject.getProjectName();
        this.dataHubVersion = versions.getHubVersion();
        this.marklogicVersion = versions.getMarkLogicVersion();
        this.stagingPort = hubConfig.getPort(DatabaseKind.STAGING);
        this.host = hubConfig.getHost();
    }

    public JsonNode toJson() {
        ObjectMapper om = new ObjectMapper();
        return om.valueToTree(this);
    }
}
