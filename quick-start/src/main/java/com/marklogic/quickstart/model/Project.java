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
package com.marklogic.quickstart.model;

import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import org.apache.commons.io.filefilter.WildcardFileFilter;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class Project {

    public int id;
    public String path;
    public List<String> environments;
    public boolean initialized = false;

    public Project(int id, String path) {
        this.id = id;
        this.path = path;
        this.initialized = isInitialized();
        this.environments = getEnvironments();
    }

    public boolean isInitialized() {
        File buildGradle = new File(this.path, "build.gradle");
        File gradleProperties = new File(this.path, "gradle.properties");

        File oldHubConfigDir = new File(this.path, HubConfig.OLD_HUB_CONFIG_DIR);
        File oldDatabasesDir = new File(oldHubConfigDir, "databases");
        File oldServersDir = new File(oldHubConfigDir, "servers");
        File oldSecurityDir = new File(oldHubConfigDir, "security");

        File hubConfigDir = new File(this.path, HubConfig.HUB_CONFIG_DIR);
        File userConfigDir = new File(this.path, HubConfig.USER_CONFIG_DIR);
        File databasesDir = new File(hubConfigDir, "databases");
        File serversDir = new File(hubConfigDir, "servers");
        File securityDir = new File(hubConfigDir, "security");

        boolean oldConfigInitialized =
            oldHubConfigDir.exists() &&
            oldHubConfigDir.isDirectory() &&
            oldDatabasesDir.exists() &&
            oldDatabasesDir.isDirectory() &&
            oldServersDir.exists() &&
            oldServersDir.isDirectory() &&
            oldSecurityDir.exists() &&
            oldSecurityDir.isDirectory();

        boolean newConfigInitialized =
            hubConfigDir.exists() &&
            hubConfigDir.isDirectory() &&
            userConfigDir.exists() &&
            userConfigDir.isDirectory() &&
            databasesDir.exists() &&
            databasesDir.isDirectory() &&
            serversDir.exists() &&
            serversDir.isDirectory() &&
            securityDir.exists() &&
            securityDir.isDirectory();

        return buildGradle.exists() &&
            gradleProperties.exists() &&
            (oldConfigInitialized || newConfigInitialized);
    }

    public List<String> getEnvironments() {
        ArrayList<String> environments = new ArrayList<String>();
        File dir = new File(this.path);
        String[] files = dir.list(new WildcardFileFilter("gradle-*.properties"));
        for (String file : files) {
            String env = file.replaceAll("^gradle-([^.]+).properties$", "$1");
            environments.add(env);
        }
        return environments;
    }

    public void initialize(HubConfig config) {
        config.projectDir = this.path;
        DataHub hub = new DataHub(config);
        hub.initProject();
        this.initialized = isInitialized();
    }
}
