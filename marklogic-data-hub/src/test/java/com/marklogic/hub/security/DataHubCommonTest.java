package com.marklogic.hub.security;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertTrue;

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

}
