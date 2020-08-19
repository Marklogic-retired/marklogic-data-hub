package com.marklogic.hub.dhs.installer.deploy;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.deploy.commands.GenerateFunctionMetadataCommand;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class GenerateFunctionMetadataInDhsTest extends AbstractHubCoreTest {

    private final static String FUNCTION_MODULE_URI = "/custom-modules/mapping-functions/echoFunction.sjs";

    @AfterEach
    void deleteTheEchoFunctionModuleSoItDoesntCauseOtherTestsToFail() {
        getHubConfig().newModulesDbClient().newDocumentManager().delete(FUNCTION_MODULE_URI);
    }

    @Test
    void test() {
        installReferenceModelProject();

        DatabaseClient modulesClient = getHubConfig().newModulesDbClient();
        assertNotNull(getHubConfig().newModulesDbClient().newDocumentManager()
            .exists("/custom-modules/mapping-functions/echoFunction.xml.xslt"));

        // Now screw up the mapping-function library on purpose
        modulesClient.newServerEval()
            .xquery(format("xdmp:node-replace(doc('%s'), document{'function echo(input) {'})", FUNCTION_MODULE_URI))
            .evalAs(String.class);

        // Generate function metadata - this should fail
        final GenerateFunctionMetadataCommand command = new GenerateFunctionMetadataCommand(getHubConfig());
        try {
            command.execute(newCommandContext());
            fail("Expected this to fail because the echoFunction module has malformed syntax");
        } catch (RuntimeException ex) {
            assertTrue(ex.getCause() instanceof FailedRequestException, "Expecting a FailedRequestException due to malformed syntax");
            String message = ex.getCause().getMessage();
            assertTrue(message.contains("SyntaxError: Unexpected token"), "Unexpected error message: " + message);
        }

        // Try again, but catch exceptions for user modules
        command.setCatchExceptionsForUserModules(true);
        command.execute(newCommandContext());
        // The error is expected to be logged but not rethrown, so the absence of an error here indicates success

        // Now fix the module and run it again
        String validText = "function echo(input) {return null;} module.exports = {echo};";
        modulesClient.newServerEval()
            .xquery(format("xdmp:node-replace(doc('%s'), document{'%s'})", FUNCTION_MODULE_URI, validText))
            .evalAs(String.class);
        command.setCatchExceptionsForUserModules(false);
        command.execute(newCommandContext());
        // absence of an error is good
    }
}
