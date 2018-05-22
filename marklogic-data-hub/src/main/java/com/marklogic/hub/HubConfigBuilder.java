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
import com.marklogic.hub.impl.HubConfigBuilderImpl;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;

import java.util.Properties;

/**
 * Helper interface that constructs a HubConfig object from a properties file or pre-existing config.
 *
 * To manipulate a HubConfig or build one from scratch {@link HubConfig}
 */
public interface HubConfigBuilder {
    /**
     * Returns a new {@link HubConfigBuilder} instance
     * @param projectDir - the hub's project directory
     * @return a new {@link HubConfigBuilder}
     */
    static HubConfigBuilder newHubConfigBuilder(String projectDir) {
        return new HubConfigBuilderImpl(projectDir);
    }

    /**
     * Tells the builder to load properties from the gradle files in the project dir
     * @return the {@link HubConfigBuilder} instance
     */
    HubConfigBuilder withPropertiesFromEnvironment();

    /**
     * Tells the builder to load properties from the gradle files in the project dir
     * but to look for an environment properties file with overrides
     * @param environment - the name of the environment to use (local,dev,qa,prod,...)
     * @return the {@link HubConfigBuilder} instance
     */
    HubConfigBuilder withPropertiesFromEnvironment(String environment);

    /**
     * Tells the builder to use the given properties. If properties are also being loaded from the
     * gradle files in the project dir, then these properties will be merged into the others taking
     * precedence over the ones loaded from disk
     * @param properties - A {@link Properties} object with properties set
     * @return the {@link HubConfigBuilder} instance
     */
    HubConfigBuilder withProperties(Properties properties);

    /**
     * Use properties to cnofigure the DHF.
     * Sets the {@link AppConfig} for the {@link HubConfig}
     * @param appConfig - an {@link AppConfig} object
     * @return the {@link HubConfigBuilder} instance
     */
    @Deprecated
    HubConfigBuilder withAppConfig(AppConfig appConfig);

    /**
     * Use properties to cnofigure the DHF.
     * Sets the {@link AdminConfig} for the {@link HubConfig}
     * @param adminConfig - an {@link AdminConfig} object
     * @return the {@link HubConfigBuilder} instance
     */
    @Deprecated
    HubConfigBuilder withAdminConfig(AdminConfig adminConfig);

    /**
     * Use properties to cnofigure the DHF.
     * Sets the {@link AdminManager} for the {@link HubConfig}
     * @param adminManager - an {@link AdminManager} object
     * @return the {@link HubConfigBuilder} instance
     */
    @Deprecated
    HubConfigBuilder withAdminManager(AdminManager adminManager);

    /**
     * Use properties to cnofigure the DHF.
     * Sets the {@link ManageConfig} for the {@link HubConfig}
     * @param manageConfig - a {@link ManageConfig} object
     * @return the {@link HubConfigBuilder} instance
     */
    @Deprecated
    HubConfigBuilder withManageConfig(ManageConfig manageConfig);

    /**
     * Use properties to cnofigure the DHF.
     * Sets the {@link ManageClient} for the {@link HubConfig}
     * @param manageClient - a {@link ManageClient}
     * @return the {@link HubConfigBuilder} instance
     */
    @Deprecated
    HubConfigBuilder withManageClient(ManageClient manageClient);

    /**
     * Builds the {@link HubConfig} instance
     * @return the created {@link HubConfig}
     */
    HubConfig build();
}
