package com.marklogic.hub.cli;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.commands.HubDeployDatabaseCommandFactory;

import java.io.File;

public class DhsDeployDatabasesCommand extends DeployOtherDatabasesCommand {

    public DhsDeployDatabasesCommand(HubConfig hubConfig) {
        setDeployDatabaseCommandFactory(new HubDeployDatabaseCommandFactory(hubConfig));
    }

    @Override
    protected String adjustPayloadBeforeSavingResource(CommandContext context, File f, String payload) {
        String[] includeProps = context.getAppConfig().getIncludeProperties();

        // This is only for props that DHF needs
        context.getAppConfig().setIncludeProperties("range-element-index", "range-path-index",
            "database-name",
            "triple-index", "collection-lexicon", "uri-lexicon", "field", "range-field-index");

        try {
            return super.adjustPayloadBeforeSavingResource(context, f, payload);
        } finally {
            context.getAppConfig().setIncludeProperties(includeProps);
        }
    }
}
