package com.marklogic.hub.dhs.installer.deploy;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.security.DeployQueryRolesetsCommand;
import com.marklogic.mgmt.SaveReceipt;
import com.marklogic.mgmt.resource.ResourceManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
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
        } catch (HttpClientErrorException ex) {
            if (isPermissionedDeniedException(ex)) {
                logger.info("Received SEC-PERMDENIED error when deploying query roleset; this can be safely ignored if the " +
                    "query roleset already exists in MarkLogic.");
            } else {
                throw ex;
            }
        }
        return receipt;
    }

    protected boolean isPermissionedDeniedException(HttpClientErrorException ex) {
        try {
            JsonNode error = ObjectMapperFactory.getObjectMapper().readTree(ex.getResponseBodyAsString());
            if (error.has("errorResponse")) {
                JsonNode errorResponse = error.get("errorResponse");
                if (errorResponse.has("messageCode")) {
                    return "SEC-PERMDENIED".equals(errorResponse.get("messageCode").asText());
                }
            }
        } catch (Exception e) {
            logger.warn("Unexpected error when trying to parse error for deploying query rolesets: " + e.getMessage());
        }
        return false;
    }
}
