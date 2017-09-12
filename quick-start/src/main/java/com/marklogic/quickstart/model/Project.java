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
import com.marklogic.hub.HubProject;
import org.apache.commons.io.filefilter.WildcardFileFilter;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class Project {

    public int id;
    public String path;

    public Project(int id, String path) {
        this.id = id;
        this.path = path;
    }

    public boolean isInitialized() {
        return new HubProject(this.path).isInitialized();
    }

    public List<String> getEnvironments() {
        ArrayList<String> environments = new ArrayList<>();
        File dir = new File(this.path);
        String[] files = dir.list(new WildcardFileFilter("gradle-*.properties"));
        for (String file : files) {
            String env = file.replaceAll("^gradle-([^.]+).properties$", "$1");
            environments.add(env);
        }
        return environments;
    }

    public void initialize(HubConfig hubConfig) {
        hubConfig.setProjectDir(this.path);
        DataHub hub = new DataHub(hubConfig);
        hub.initProject();
    }
}
