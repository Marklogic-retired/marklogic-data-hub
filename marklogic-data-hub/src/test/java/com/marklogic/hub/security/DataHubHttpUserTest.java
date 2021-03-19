package com.marklogic.hub.security;

import com.marklogic.mgmt.api.security.Role;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class DataHubHttpUserTest extends AbstractSecurityTest {

    @Override
    protected String getRoleName() {
        return "data-hub-http-user";
    }

    @Test
    void documentPrivilegeInclusions() {
        List<String> privilegeNames = roleBeingTested.getPrivilege().stream()
            .map(rolePrivilege -> rolePrivilege.getPrivilegeName())
            .collect(Collectors.toList());

        assertTrue(privilegeNames.contains("xdmp:http-get"), "Added in 5.5.0 to permit use of HTTP functions");
        assertTrue(privilegeNames.contains("xdmp:http-post"), "Added in 5.5.0 to permit use of HTTP functions");
        assertTrue(privilegeNames.contains("xdmp:http-put"), "Added in 5.5.0 to permit use of HTTP functions");
        assertTrue(privilegeNames.contains("xdmp:http-head"), "Added in 5.5.0 to permit use of HTTP functions");
        assertTrue(privilegeNames.contains("xdmp:http-delete"), "Added in 5.5.0 to permit use of HTTP functions");
        assertTrue(privilegeNames.contains("xdmp:http-options"), "Added in 5.5.0 to permit use of HTTP functions");
    }

    @Test
    void testCreateHttpRole() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        //'dh-common' is added so that user can do eval
        runAsTestUserWithRoles("data-hub-http-user", "data-hub-common").getStagingClient().newServerEval().javascript("xdmp.httpGet(\"http://www.marklogic.com\")").eval();
    }

}
