package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.SystemService;
import com.marklogic.hub.impl.HubConfigImpl;

/**
 * FinishHubDeployment will invoke the dataservice finishHubDeployment to complete hub deployment.
 * This is the last command to be executed in the hub deployment.
 */

public class FinishHubDeploymentCommand extends AbstractCommand {

    private HubConfigImpl hubConfig;

    public FinishHubDeploymentCommand(HubConfig hubConfig) {
        this.hubConfig = (HubConfigImpl) hubConfig;
        setExecuteSortOrder(Integer.MAX_VALUE);
    }

    @Override
    public void execute(CommandContext context) {
        SystemService.on(hubConfig.newHubClient().getStagingClient()).finishHubDeployment();
    }
}
