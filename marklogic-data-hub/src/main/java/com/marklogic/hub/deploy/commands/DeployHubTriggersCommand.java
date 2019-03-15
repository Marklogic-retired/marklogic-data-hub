package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand;

/**
 * DHF extension that provides support for writing triggers to any triggers database.
 */
public class DeployHubTriggersCommand extends DeployTriggersCommand {


    public DeployHubTriggersCommand(String triggersDatabase) {
        setDatabaseIdOrName(triggersDatabase);
    }

    @Override
    public void execute(CommandContext context) {
        super.execute(context);
    }
}
