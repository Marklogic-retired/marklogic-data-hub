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
