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

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.query.DeleteQueryDefinition;
import com.marklogic.client.query.QueryManager;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;

public class ClearDHFModulesCommand extends AbstractCommand
{
    private HubConfig hubConfig;
    private DataHub dataHub;

    public ClearDHFModulesCommand(HubConfig hubConfig, DataHub dataHub)
    {
        this.hubConfig = hubConfig;
        this.dataHub = dataHub;
    }

    @Override
    public void execute(CommandContext context)
    {
        DatabaseClient databaseClient = hubConfig.newModulesDbClient();
        QueryManager queryManager = databaseClient.newQueryManager();

        // Clear user modules
        dataHub.clearUserModules();

        // Clear DHF core modules
        DeleteQueryDefinition queryDefinition = queryManager.newDeleteDefinition();
        queryDefinition.setCollections("hub-core-module");
        queryManager.delete(queryDefinition);
    }
}
