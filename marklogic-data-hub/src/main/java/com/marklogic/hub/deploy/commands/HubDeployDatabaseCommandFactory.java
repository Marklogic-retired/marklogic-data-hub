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
        if (filename == null) {
            throw new RuntimeException("Unable to determine the filename of the database file");
        }
        DeployHubDatabaseCommand c = new DeployHubDatabaseCommand(hubConfig, databaseFile, filename);
        c.setDeployDatabaseCommandFactory(this);
        return c;
    }
}
