package com.marklogic.hub.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommand;

public class DeployModulesDatabaseCommand extends DeployDatabaseCommand {
    public DeployModulesDatabaseCommand(String databaseName) {
        super();
        this.setDatabaseName(databaseName);
        this.setCreateDatabaseWithoutFile(true);
        this.setExecuteSortOrder(SortOrderConstants.DEPLOY_OTHER_SERVERS);
    }

    @Override
    protected String getPayload(CommandContext context) {
        return format("{\"database-name\": \"%s\","
                + "\"uri-lexicon\": true,"
                + "\"collection-lexicon\":true}", getDatabaseName());
    }
}
