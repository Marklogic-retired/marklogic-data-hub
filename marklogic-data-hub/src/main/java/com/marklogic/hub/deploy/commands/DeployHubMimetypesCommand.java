package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.mimetypes.DeployMimetypesCommand;
import com.marklogic.hub.HubConfig;

import java.io.File;

public class DeployHubMimetypesCommand extends DeployMimetypesCommand {

    private HubConfig config;

    public DeployHubMimetypesCommand(HubConfig config) {
        super();
        this.config = config;
    }

    @Override
    protected File[] getResourceDirs(CommandContext context) {
        return new File[]{config.getHubMimetypesDir().toFile()};
    }
}
