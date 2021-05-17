package com.marklogic.hub.security;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.hub.DatabaseKind;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

public class DataHubCommonTest extends AbstractSecurityTest {

    @Override
    protected String getRoleName() {
        return "data-hub-common";
    }

    @Test
    void documentPrivilegeInclusions() {
        List<String> privilegeNames = roleBeingTested.getPrivilege().stream()
            .map(rolePrivilege -> rolePrivilege.getPrivilegeName())
            .collect(Collectors.toList());

        assertTrue(privilegeNames.contains("debug-any-requests"), "Added in 5.4.0 to support debugging, particularly by Support");
        assertTrue(privilegeNames.contains("debug-my-requests"), "Added in 5.4.0 to support debugging, particularly by Support");
        assertTrue(privilegeNames.contains("my-transaction-locks"), "Added in 5.4.0 to support debugging");
        assertTrue(privilegeNames.contains("profile-my-requests"), "Added in 5.4.0 to support debugging performance");
        assertTrue(privilegeNames.contains("set-my-transaction-name"), "Added in 5.4.0 to support custom code");
        assertTrue(privilegeNames.contains("term-query"), "Added in 5.4.0 to allow for cts.termQuery usage, which is needed " +
            "for 'expert' queries like finding all documents with a particular permission");
        assertTrue(privilegeNames.contains("xdmp:plan"), "Added in 5.4.0 to support debugging");
        assertTrue(privilegeNames.contains("xdmp:sql"), "Added in 5.4.0 to allow for SQL queries in custom code");
        assertTrue(privilegeNames.contains("xdmp:timestamp"), "Added in 5.4.0 to allow for point-in-time queries in custom code");
        assertTrue(privilegeNames.contains("xdmp:xslt-invoke"), "In 5.4.0, moved from data-hub-common-writer to data-hub-common " +
            "since it does not involve writing data");
    }

    @Test
    void verifyStatusPrivilege() {
        runAsTestUserWithRoles(getRoleName());

        DatabaseClient client = getHubClient().getFinalClient();
        ObjectNode serverStatus = readJsonObject(client.newServerEval().javascript("xdmp.serverStatus(xdmp.host(), xdmp.server())").evalAs(String.class));
        assertEquals(getHubClient().getDbName(DatabaseKind.FINAL), serverStatus.get("serverName").asText(),
            "Just verifying that the user can get server status via the 'status' privilege");

        ObjectNode hostStatus = readJsonObject(client.newServerEval().javascript("xdmp.hostStatus(xdmp.host())").evalAs(String.class));
        assertNotNull(hostStatus, "Verifying user can get host status via the 'status' privilege");
    }

    @Test
    void verifyCancelMyRequests() {
        runAsTestUserWithRoles(getRoleName());

        DatabaseClient client = getHubClient().getFinalClient();
        try {
            client.newServerEval().javascript("xdmp.requestCancel(xdmp.host(), xdmp.server(), xdmp.request())").evalAs(String.class);
            fail("Expected an error because the user canceled the request");
        } catch (FailedRequestException ex) {
            assertTrue(ex.getServerMessage().startsWith("XDMP-CANCELED: "),
                "Expected the call to requestCancel to succeed since the user has the cancel-my-requests privilege; message: " + ex.getServerMessage());
        }
    }

    @Test
    void verifySetMyRequestLimit() {
        runAsTestUserWithRoles(getRoleName());

        assertDoesNotThrow(
            () -> getHubClient().getFinalClient().newServerEval()
                .javascript("xdmp.setRequestTimeLimit(10, xdmp.host(), xdmp.server(), xdmp.request())")
                .evalAs(String.class),
            "A data-hub-common user has the set-my-time-limit privilege, so this should work"
        );
    }
}
