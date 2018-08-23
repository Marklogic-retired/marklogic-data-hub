package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.hub.HubConfig;

public class DeployHubStagingSchemasDatabaseCommand extends DeployHubDatabaseCommand {
    public final static String DATABASE_FILENAME = "staging-schemas-database.json";

    public DeployHubStagingSchemasDatabaseCommand(HubConfig hubConfig) {
        super(hubConfig, DATABASE_FILENAME);
        setExecuteSortOrder(SortOrderConstants.DEPLOY_SCHEMAS_DATABASE);
        setUndoSortOrder(SortOrderConstants.DELETE_SCHEMAS_DATABASE);
        setCreateForestsOnEachHost(false);
    }
}

