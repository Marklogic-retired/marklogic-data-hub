package com.marklogic.hub.security;

import com.marklogic.client.FailedRequestException;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DataHubSpawnUserTest extends AbstractHubCoreTest {

    @Test
    void useSpawn() {
        runAsTestUserWithRoles("data-hub-spawn-user", "data-hub-common");
        useXdmpSpawn(); // lack of error means success

        runAsDataHubDeveloper();
        FailedRequestException ex = assertThrows(FailedRequestException.class, () -> useXdmpSpawn(),
            "No DHF role inherits data-hub-spawn-user by default; if Pari wants to use xdmp.spawn, she'll need to do " +
                "so via a custom role that inherits data-hub-spawn-user. This is done to not encourage xdmp.spawn " +
                "usage and instead require users to opt into its usage.");
        assertTrue(ex.getMessage().contains("Need privilege: http://marklogic.com/xdmp/privileges/xdmp-spawn"));
    }

    private void useXdmpSpawn() {
        // We don't care about the response, just whether an error is thrown or not
        getHubClient().getFinalClient().newServerEval()
            .javascript("xdmp.spawn('/data-hub/5/data-services/models/getPrimaryEntityTypes.sjs')")
            .evalAs(String.class);
    }
}
