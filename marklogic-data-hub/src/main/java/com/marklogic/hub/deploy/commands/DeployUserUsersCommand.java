package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.security.DeployUsersCommand;
import com.marklogic.hub.HubConfig;

import java.io.File;

public class DeployUserUsersCommand extends DeployUsersCommand
{

    private HubConfig hubConfig;

    public DeployUserUsersCommand(HubConfig hubConfig) {
        super();
        this.hubConfig = hubConfig;
    }

    @Override
    protected File[] getResourceDirs(CommandContext context) {
        return new File[] {
            hubConfig.getUserSecurityDir().resolve("users").toFile()
        };
    }
}
