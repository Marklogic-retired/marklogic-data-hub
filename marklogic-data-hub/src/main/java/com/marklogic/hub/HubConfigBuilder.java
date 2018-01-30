/*
 * Copyright 2012-2018 MarkLogic Corporation
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

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.DefaultAppConfigFactory;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.DefaultManageConfigFactory;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import com.marklogic.mgmt.admin.DefaultAdminConfigFactory;
import com.marklogic.mgmt.util.SimplePropertySource;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.Properties;

/**
 * A class for building a HubConfig class. Create a HubConfig instance like so:
 *
 * <pre>{@code
 *     HubConfig hubConfig = HubConfigBuilder.newHubConfigBuilder("/path/to/your/project")
 *         .withPropertiesFromEnvironment("local")
 *         .build();
 *}</pre>
 */
public class HubConfigBuilder {

    private static final String GRADLE_PROPERTIES_FILENAME = "gradle.properties";

    private HubConfigImpl hubConfig;

    private String projectDir;

    private Properties properties;

    private boolean usePropertiesFromEnvironment = false;
    private String environment;

    private ManageConfig manageConfig;
    private ManageClient manageClient;
    private AdminConfig adminConfig;
    private AdminManager adminManager;
    private AppConfig appConfig;

    private HubConfigBuilder(String projectDir) {
        this.projectDir = projectDir;
        this.hubConfig = new HubConfigImpl(projectDir);
    }

    /**
     * Returns a new {@link HubConfigBuilder} instance
     * @param projectDir - the hub's project directory
     * @return a new {@link HubConfigBuilder}
     */
    public static HubConfigBuilder newHubConfigBuilder(String projectDir) {
        return new HubConfigBuilder(projectDir);
    }

    /**
     * Tells the builder to load properties from the gradle files in the project dir
     * @return the {@link HubConfigBuilder} instance
     */
    public HubConfigBuilder withPropertiesFromEnvironment() {
        return withPropertiesFromEnvironment(null);
    }

    /**
     * Tells the builder to load properties from the gradle files in the project dir
     * but to look for an environment properties file with overrides
     * @param environment - the name of the environment to use (local,dev,qa,prod,...)
     * @return the {@link HubConfigBuilder} instance
     */
    public HubConfigBuilder withPropertiesFromEnvironment(String environment) {
        this.usePropertiesFromEnvironment = true;
        this.environment = environment;
        return this;
    }

    /**
     * Tells the builder to use the given properties. If properties are also being loaded from the
     * gradle files in the project dir, then these properties will be merged into the others taking
     * precedence over the ones loaded from disk
     * @param properties - A {@link Properties} object with properties set
     * @return the {@link HubConfigBuilder} instance
     */
    public HubConfigBuilder withProperties(Properties properties) {
        this.properties = properties;
        return this;
    }

    /**
     * Sets the {@link AppConfig} for the {@link HubConfig}
     * @param appConfig - an {@link AppConfig} object
     * @return the {@link HubConfigBuilder} instance
     */
    public HubConfigBuilder withAppConfig(AppConfig appConfig) {
        this.appConfig = appConfig;
        return this;
    }

    /**
     * Sets the {@link AdminConfig} for the {@link HubConfig}
     * @param adminConfig - an {@link AdminConfig} object
     * @return the {@link HubConfigBuilder} instance
     */
    public HubConfigBuilder withAdminConfig(AdminConfig adminConfig) {
        this.adminConfig = adminConfig;
        return this;
    }

    /**
     * Sets the {@link AdminManager} for the {@link HubConfig}
     * @param adminManager - an {@link AdminManager} object
     * @return the {@link HubConfigBuilder} instance
     */
    public HubConfigBuilder withAdminManager(AdminManager adminManager) {
        this.adminManager = adminManager;
        return this;
    }

    /**
     * Sets the {@link ManageConfig} for the {@link HubConfig}
     * @param manageConfig - a {@link ManageConfig} object
     * @return the {@link HubConfigBuilder} instance
     */
    public HubConfigBuilder withManageConfig(ManageConfig manageConfig) {
        this.manageConfig = manageConfig;
        return this;
    }

    /**
     * Sets the {@link ManageClient} for the {@link HubConfig}
     * @param manageClient - a {@link ManageClient}
     * @return the {@link HubConfigBuilder} instance
     */
    public HubConfigBuilder withManageClient(ManageClient manageClient) {
        this.manageClient = manageClient;
        return this;
    }

    /**
     * Builds the {@link HubConfig} instance
     * @return the created {@link HubConfig}
     */
    public HubConfig build() {
        Properties actualProperties = null;
        if (usePropertiesFromEnvironment) {
            actualProperties = getPropertiesFromEnvironment();
        }

        if (actualProperties == null) {
            actualProperties = new Properties();
        }


        Properties tmpProperties = actualProperties;
        if (properties != null) {
            properties.forEach(tmpProperties::put);
        }

        hubConfig.loadConfigurationFromProperties(actualProperties);

        SimplePropertySource propertySource = new SimplePropertySource(actualProperties);

        if (appConfig != null) {
            hubConfig.setAppConfig(appConfig);
        }
        else {
            hubConfig.setAppConfig(new DefaultAppConfigFactory(propertySource).newAppConfig());
        }

        if (adminConfig != null) {
            hubConfig.setAdminConfig(adminConfig);
        }
        else {
            hubConfig.setAdminConfig(new DefaultAdminConfigFactory(propertySource).newAdminConfig());
        }

        if (adminManager != null) {
            hubConfig.setAdminManager(adminManager);
        }
        else {
            hubConfig.setAdminManager(new AdminManager(hubConfig.getAdminConfig()));
        }

        if (manageConfig != null) {
            hubConfig.setManageConfig(manageConfig);
        }
        else {
            hubConfig.setManageConfig(new DefaultManageConfigFactory(propertySource).newManageConfig());
        }

        if (manageClient != null) {
            hubConfig.setManageClient(manageClient);
        }
        else {
            hubConfig.setManageClient(new ManageClient(hubConfig.getManageConfig()));
        }

        return hubConfig;
    }

    // loads properties off of disk
    private Properties getPropertiesFromEnvironment() {
        Properties environmentProperties = new Properties();

        File file = new File(this.projectDir, GRADLE_PROPERTIES_FILENAME);
        loadPropertiesFromFile(file, environmentProperties);
        if (environment != null) {
            File envPropertiesFile = new File(this.projectDir, "gradle-" + environment + ".properties");
            loadPropertiesFromFile(envPropertiesFile, environmentProperties);
        }

        return environmentProperties;
    }

    // loads properties from a .properties file
    private void loadPropertiesFromFile(File propertiesFile, Properties loadedProperties) {
        InputStream is;
        try {
            if(propertiesFile.exists()) {
                is = new FileInputStream( propertiesFile );
                loadedProperties.load( is );
                is.close();
            }
        }
        catch ( Exception e ) {
            e.printStackTrace();
        }
    }
}
