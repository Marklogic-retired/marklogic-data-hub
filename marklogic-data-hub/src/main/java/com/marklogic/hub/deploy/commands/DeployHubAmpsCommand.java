package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.hub.MarkLogicVersion;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.SaveReceipt;
import com.marklogic.mgmt.resource.ResourceManager;
import com.marklogic.mgmt.resource.security.AmpManager;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.io.File;

/**
 * This command is used instead of DeployAmpsCommand when a data-hub-security-admin user is deploying
 * amps. It's because PUT request fail due to https://bugtrack.marklogic.com/55309.
 */
public class DeployHubAmpsCommand extends DeployAmpsCommand {

    /**
     * DeployHubAmpsCommand should run before we run LoadHubModulesCommand as we require the amp for getting the default
     * rewriter to be present so that it can be used to generate the custom rewriter.
     */
   public DeployHubAmpsCommand() {
       super();
       setExecuteSortOrder(390);
   }

    @Override
    public boolean cmaShouldBeUsed(CommandContext context) {
        return false;
    }

    /**
     * The parent class's execute method eagerly grabs amps for performance reasons. That causes an unexpected failure
     * when a data-hub-developer mistakenly runs this command, but there aren't any amps to deploy. To avoid this,
     * this class just does the basic thing of processing amp files in each resource directory. The performance
     * logic in the parent class isn't needed since it's specific to CMA which isn't used by DhsDeployer.
     *
     * @param context
     */
    @Override
    public void execute(CommandContext context) {
        for (File resourceDir : getResourceDirs(context)) {
            processExecuteOnResourceDir(context, resourceDir);
        }
    }

    @Override
    protected ResourceManager getResourceManager(CommandContext context) {
        return new HubAmpManager(context.getManageClient());
    }

    class HubAmpManager extends AmpManager {

        public HubAmpManager(ManageClient client) {
            super(client);
        }

        @Override
        protected String getResourceName() {
            return "amp";
        }

        @Override
        public SaveReceipt updateResource(String payload, String resourceId) {

            SaveReceipt receipt = null;
            try {
                receipt = super.updateResource(payload, resourceId);
            } catch (HttpClientErrorException ex) {
                if (HttpStatus.FORBIDDEN.equals(ex.getStatusCode()) && cannotUpdateAmps()) {
                    logger.error("An error occurred while trying to update an amp: " + ex.getMessage()
                        + ". Updates to amps as a user with the data-hub-security-admin role are not allowed " +
                        "in this version of MarkLogic, so this error is being logged and not thrown. " +
                        "If you need to modify the amp, you must delete it first via the Manage API.");
                } else {
                    throw ex;
                }
            }
            return receipt;
        }

        private boolean cannotUpdateAmps() {
            try {
                return new MarkLogicVersion(getManageClient()).cannotUpdateAmps();
            } catch (Exception e) {
                logger.warn("Could not determine MarkLogic version; cause: " + e.getMessage() + "; will assume that user can update amps and will throw original exception");
                return false;
            }
        }
    }

}
