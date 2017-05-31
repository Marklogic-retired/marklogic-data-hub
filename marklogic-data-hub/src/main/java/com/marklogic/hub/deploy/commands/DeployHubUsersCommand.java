package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.security.DeployUsersCommand;
import com.marklogic.hub.HubConfig;

import java.io.File;

public class DeployHubUsersCommand extends DeployUsersCommand {

    private HubConfig hubConfig;

    public DeployHubUsersCommand(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override
    protected File[] getResourceDirs(CommandContext context) {
        return new File[] {
            hubConfig.getHubSecurityDir().resolve("users").toFile(),
            hubConfig.getUserSecurityDir().resolve("users").toFile()
        };
    }
}
