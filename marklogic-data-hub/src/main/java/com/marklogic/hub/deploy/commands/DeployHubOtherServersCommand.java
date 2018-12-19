package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.appservers.DeployOtherServersCommand;
import com.marklogic.mgmt.resource.ResourceManager;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.io.File;

/**
 * Extends the ml-app-deployer command to provide some custom error handling.
 */
public class DeployHubOtherServersCommand extends DeployOtherServersCommand {

    @Override
    protected void deleteResource(ResourceManager mgr, CommandContext context, File f) {
        try {
            super.deleteResource(mgr, context, f);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                logger.warn("Unable to delete resource due to missing user or bad credentials, skipping.");
            } else {
                throw e;
            }
        }
    }

}
