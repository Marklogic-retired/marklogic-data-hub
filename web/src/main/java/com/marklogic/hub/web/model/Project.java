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
package com.marklogic.hub.web.model;

import com.marklogic.hub.HubProject;
import org.apache.commons.io.filefilter.WildcardFileFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@Component
public class Project {

    public int id;
    public String path;

    @Autowired
    private HubProject hubProject;

    public void setId(int id) {
        this.id = id;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public boolean isInitialized() {
        hubProject.createProject(this.path);
        return hubProject.isInitialized();
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
}
