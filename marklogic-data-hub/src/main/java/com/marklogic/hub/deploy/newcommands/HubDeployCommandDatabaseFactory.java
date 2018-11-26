package com.marklogic.hub.deploy.newcommands;

import com.marklogic.appdeployer.command.databases.DeployDatabaseCommand;
import com.marklogic.appdeployer.command.databases.DeployDatabaseCommandFactory;
import com.marklogic.hub.HubConfig;

import java.io.File;

public class HubDeployCommandDatabaseFactory implements DeployDatabaseCommandFactory {

    private HubConfig hubConfig;

    public HubDeployCommandDatabaseFactory(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override
    public DeployDatabaseCommand newDeployDatabaseCommand(File databaseFile) {
        final String filename = databaseFile != null ? databaseFile.getName() : null;
        DeployHubDatabaseCommand c = new DeployHubDatabaseCommand(hubConfig, filename);
        c.setDeployDatabaseCommandFactory(this);
        return c;
    }
}
