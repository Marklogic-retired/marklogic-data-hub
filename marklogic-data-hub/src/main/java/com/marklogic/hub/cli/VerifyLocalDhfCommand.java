package com.marklogic.hub.cli;

import com.beust.jcommander.Parameters;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.resource.security.RoleManager;
import com.marklogic.mgmt.resource.security.UserManager;
import com.marklogic.rest.util.ResourcesFragment;

@Parameters(commandDescription = "Verify a DHF installation in a local (non-DHS) environment")
public class VerifyLocalDhfCommand extends AbstractVerifyCommand {

    public VerifyLocalDhfCommand(HubConfigImpl hubConfig) {
        super(hubConfig);
    }

    @Override
    public void run(Options options) {
        initializeProject(hubConfig, options, System.getProperties());

        long start = System.currentTimeMillis();

        verifyRoles();
        verifyUsers();
        verifyPrivileges();
        verifyAmps();

        verifyStagingDatabase();
        verifyFinalDatabase();
        verifyJobDatabase();

        verifyTriggers();

        final String group = hubConfig.getAppConfig().getGroupName();
        verifyStagingServer(group);
        verifyFinalServer(group);
        verifyJobServer(group);

        verifyModules();
        verifyArtifacts();

        logger.info("Time to verify: " + (System.currentTimeMillis() - start));
    }

    private void verifyRoles() {
        ResourcesFragment roles = new RoleManager(hubConfig.getManageClient()).getAsXml();
        for (String role : getDhfRoleNames()) {
            verify(roles.resourceExists(role), "Expected role to be created: " + role);
        }
    }

    private void verifyUsers() {
        ResourcesFragment users = new UserManager(hubConfig.getManageClient()).getAsXml();
        for (String user : getDhfUserNames()) {
            verify(users.resourceExists(user), "Expected user to be created: " + user);
        }
    }

    private void verifyModules() {
        DatabaseClient client = hubConfig.newModulesDbClient();
        try {
            // The count of modules differs based on whether the trace-ui modules were loaded
            // So just verify a few modules exist
            String[] expectedUris = new String[]{
                "/com.marklogic.hub/config.sjs",
                "/data-hub/5/builtins/steps/mapping/default/lib.sjs",
                "/com.marklogic.smart-mastering/algorithms/base.xqy"
            };
            GenericDocumentManager mgr = client.newDocumentManager();
            for (String uri : expectedUris) {
                verify(mgr.exists(uri) != null, "Expected URI to be in modules database: " + uri);
            }
        } finally {
            client.release();
        }
    }
}
