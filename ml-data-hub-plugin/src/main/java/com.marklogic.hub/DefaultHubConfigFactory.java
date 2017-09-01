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
package com.marklogic.hub;

import com.marklogic.gradle.ProjectPropertySource;
import com.marklogic.mgmt.util.PropertySourceFactory;
import org.gradle.api.Project;

import java.util.Properties;

public class DefaultHubConfigFactory extends PropertySourceFactory {

    private Project project;
    private Properties properties;

    public DefaultHubConfigFactory(Project project, ProjectPropertySource propertySource) {
        super(propertySource);
        this.project = project;
        this.properties = propertySource.getProperties();
    }

    public HubConfig newHubConfig() {
        HubConfig hubConfig = new HubConfig();
        hubConfig.loadConfigurationFromProperties(properties);

        if (hubConfig.getProjectDir().equals(".")) {
            hubConfig.setProjectDir(project.getProjectDir().getAbsolutePath());
        }
        return hubConfig;
    }
}
