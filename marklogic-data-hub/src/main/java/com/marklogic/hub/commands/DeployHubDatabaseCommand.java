package com.marklogic.hub.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommand;

/**
 * Can be used for creating any kind of database with any sorts of forests. Specifying a config file for the database or
 * for the forests is optional. In order to create forests with different parameters, use DeployForestsCommand.
 */
public class DeployHubDatabaseCommand extends DeployDatabaseCommand {

    public DeployHubDatabaseCommand(String databaseName) {
        super();
        this.setDatabaseName(databaseName);
        this.setCreateDatabaseWithoutFile(true);
        this.setExecuteSortOrder(SortOrderConstants.DEPLOY_CONTENT_DATABASES);
    }

    @Override
    protected String getPayload(CommandContext context) {
        return format("{\"database-name\": \"%s\","
                + "\"triple-index\": true,"
                + "\"collection-lexicon\":true}", getDatabaseName());
    }
}
