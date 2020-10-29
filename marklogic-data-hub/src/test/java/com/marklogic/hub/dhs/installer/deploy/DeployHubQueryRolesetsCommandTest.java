package com.marklogic.hub.dhs.installer.deploy;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.MarkLogicVersion;
import com.marklogic.hub.security.AbstractSecurityTest;
import com.marklogic.mgmt.SaveReceipt;
import com.marklogic.mgmt.resource.security.QueryRolesetManager;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class DeployHubQueryRolesetsCommandTest extends AbstractSecurityTest {

    @Override
    protected String getRoleName() {
        return "data-hub-developer";
    }

    @Test
    void test() {
        DeployHubQueryRolesetsCommand command = new DeployHubQueryRolesetsCommand();
        assertFalse(command.cmaShouldBeUsed(null), "We don't want to use CMA for query rolesets, because " +
            "at least in ML 10.0-3, when QRs are submitted via CMA by a user without the security role and " +
            "one or more QRs already exist, an exception will be thrown");


        QueryRolesetManager mgr = new QueryRolesetManager(userWithRoleBeingTestedClient);
        final String payload = "{\n" +
            "\t\"role-name\": [\n" +
            "\t\t\"view-admin\",\n" +
            "\t\t\"flexrep-user\"\n" +
            "\t]\n" +
            "}\n";

        SaveReceipt receipt = command.saveResource(mgr, new CommandContext(new AppConfig(), userWithRoleBeingTestedClient, null), payload);
        final String rolesetPath = receipt.getResponse().getHeaders().getLocation().toString();
        try {
            assertEquals(201, receipt.getResponse().getStatusCodeValue(), "The query roleset should have been created " +
                "successfully because data-hub-developer has the add-query-rolesets privilege");

            if ("10.0-3".equals(new MarkLogicVersion(getHubClient().getManageClient()).getVersionString())) {
                receipt = command.saveResource(mgr, new CommandContext(new AppConfig(), userWithRoleBeingTestedClient, null), payload);
                Assertions.assertNull(receipt, "The receipt object will be null because the Manage API threw an exception, since a " +
                    "user without the security role can't call POST again on a query roleset, and the data-hub-developer " +
                    "user doesn't have the security role. And a PUT call can't be made because the GET endpoint for a " +
                    "roleset doesn't support passing in the role names that constitute a roleset, so there's no way to " +
                    "figure out the roleset ID which would be required by the PUT call." +
                    "" +
                    "So instead of an exception being thrown, check the logging to verify that a message was logged " +
                    "indicating that the SEC-PERMDENIED exception can be safely ignored if the query roleset has already " +
                    "been deployed. This is the best we can do in DHF based on ML 10.0-3.");
            } else {
                logger.info("On the nightly build for 10.0-4, the bug with query rolesets has been fixed. " +
                    "Once 10.0-4 is released, we can update this test to verify the above condition is longer met.");
            }
        } finally {
            // The lack of an exception from this verifies that the roleset was deleted successfully
            userWithRoleBeingTestedClient.delete(rolesetPath);
        }
    }
}
