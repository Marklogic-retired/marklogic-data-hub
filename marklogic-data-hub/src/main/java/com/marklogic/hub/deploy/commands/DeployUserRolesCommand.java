package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.hub.HubConfig;

import java.io.File;

public class DeployUserRolesCommand extends DeployRolesCommand
{

    private HubConfig hubConfig;

    public DeployUserRolesCommand(HubConfig hubConfig) {
        super();
        this.hubConfig = hubConfig;
    }

    @Override
    protected File[] getResourceDirs(CommandContext context) {
        return new File[] {
            hubConfig.getUserSecurityDir().resolve("roles").toFile()
        };
    }
}

