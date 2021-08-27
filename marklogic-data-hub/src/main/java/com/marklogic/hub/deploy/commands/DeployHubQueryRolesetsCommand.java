package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.security.DeployQueryRolesetsCommand;
import com.marklogic.hub.util.QueryRolesetUtil;
import com.marklogic.mgmt.SaveReceipt;
import com.marklogic.mgmt.resource.ResourceManager;
import org.springframework.web.client.HttpClientErrorException;

/**
 * This command is used instead of DeployQueryRolesetsCommand for when a data-hub-developer user is deploying
 * query rolesets. See the comments in the test class for this class to understand why it exists.
 */
public class DeployHubQueryRolesetsCommand extends DeployQueryRolesetsCommand {

    @Override
    public boolean cmaShouldBeUsed(CommandContext context) {
        return false;
    }

    @Override
    protected SaveReceipt saveResource(ResourceManager mgr, CommandContext context, String payload) {
        SaveReceipt receipt = null;
        try {
            receipt = super.saveResource(mgr, context, payload);
        }
        catch (HttpClientErrorException ex) {
            QueryRolesetUtil.handleSaveException(ex);
        }
        return receipt;
    }
}
