/*
 * Copyright 2012-2019 MarkLogic Corporation
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

package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.databases.DeployDatabaseCommand;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommandFactory;
import com.marklogic.hub.HubConfig;

import java.io.File;

/**
 * Hub-specific factory implementation that's used to construct the hub-specific command for deploying a database.
 */
public class HubDeployDatabaseCommandFactory implements DeployDatabaseCommandFactory {

    private HubConfig hubConfig;

    public HubDeployDatabaseCommandFactory(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override
    public DeployDatabaseCommand newDeployDatabaseCommand(File databaseFile) {
        final String filename = databaseFile != null ? databaseFile.getName() : null;
        DeployHubDatabaseCommand c = new DeployHubDatabaseCommand(hubConfig, databaseFile, filename);
        c.setDeployDatabaseCommandFactory(this);
        return c;
    }
}
