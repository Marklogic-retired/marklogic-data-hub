package com.marklogic.hub.deploy.commands;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.server.Server;
import com.marklogic.mgmt.resource.appservers.ServerManager;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Verifies that if a user sets the staging and final ports to be the same value, hub modules can still be loaded, even
 * though that single app server is intended to use a custom rewriter.
 */
public class LoadHubModulesWithSingleAppServerTest extends AbstractHubCoreTest {

    private final static String STAGING_REWRITER_URI = "/data-hub/5/rest-api/staging-rewriter.xml";

    @Test
    void stagingAndFinalPointToSamePortAndCustomRewriterDoesntExist() {
        Integer originalFinalPort = getHubConfig().getPort(DatabaseKind.FINAL);
        getHubConfig().setPort(DatabaseKind.FINAL, getHubConfig().getPort(DatabaseKind.STAGING));

        runAsAdmin();

        try {
            GenericDocumentManager modulesDocManager = getHubClient().getModulesClient().newDocumentManager();
            modulesDocManager.delete(STAGING_REWRITER_URI);
            assertNull(modulesDocManager.exists(STAGING_REWRITER_URI));

            // Without updating the server properties, ML will use a cached copy of the rewriter and won't realize it's
            // been deleted
            new Server(new API(getHubConfig().getManageClient()), getHubConfig().getDbName(DatabaseKind.STAGING)).save();
            DatabaseClient.ConnectionResult connectionResult = getHubConfig().newStagingClient().checkConnection();
            assertEquals(404, connectionResult.getStatusCode(), "Expecting a 404 since the custom rewriter for the staging app " +
                "server was deleted");

            LoadHubModulesCommand command = new LoadHubModulesCommand(getHubConfig());
            assertTrue(command.needToSwitchToDefaultRewriter());
            command.execute(newCommandContext());

            assertEquals(STAGING_REWRITER_URI, modulesDocManager.exists(STAGING_REWRITER_URI).getUri(), "Verifying that " +
                "loading the hub modules with the custom rewriter missing still works, as the command should have " +
                "temporarily modified the staging/final app server to use the default ML REST rewriter so that modules " +
                "could be loaded and the custom rewriter could be generated");

            ObjectNode serverProps = readJsonObject(
                new ServerManager(getHubConfig().getManageClient()).getPropertiesAsJson(getHubConfig().getDbName(DatabaseKind.STAGING))
            );
            assertEquals(STAGING_REWRITER_URI, serverProps.get("url-rewriter").asText(), "Verifying that the rewriter " +
                "on the staging app server was set back to be the custom one after it was temporarily switched to be the " +
                "default ML REST rewriter");
        } finally {
            getHubConfig().setPort(DatabaseKind.FINAL, originalFinalPort);

            // Make sure custom rewriter exists so no subsequent tests break
            new LoadHubModulesCommand(getHubConfig()).createCustomRewriters();
        }
    }

    @Test
    void dontNeedToSwitchToDefaultRewriter() {
        LoadHubModulesCommand command = new LoadHubModulesCommand(getHubConfig());

        assertFalse(command.needToSwitchToDefaultRewriter(), "Don't need to switch since the staging and final " +
            "ports are different, and thus the final app server must exist with its default rewriter, which can be " +
            "used for loading modules");

        Integer originalFinalPort = getHubConfig().getFinalPort();
        try {
            getHubConfig().setFinalPort(getHubConfig().getStagingPort());
            assertFalse(command.needToSwitchToDefaultRewriter(), "Still don't need to switch since the custom rewriter " +
                "still exists, which means loading modules via the single app server will work");
        } finally {
            getHubConfig().setFinalPort(originalFinalPort);
        }
    }
}
