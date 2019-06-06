package com.marklogic.hub.cli;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.deploy.commands.DeployHubOtherServersCommand;

import java.io.File;

public class DhsDeployServersCommand extends DeployHubOtherServersCommand {

    @Override
    protected String adjustPayloadBeforeSavingResource(CommandContext context, File f, String payload) {
        String[] includeProps = context.getAppConfig().getIncludeProperties();
        context.getAppConfig().setIncludeProperties("server-name", "error-handler", "url-rewriter");
        try {
            return super.adjustPayloadBeforeSavingResource(context, f, payload);
        } finally {
            context.getAppConfig().setIncludeProperties(includeProps);
        }
    }
}
