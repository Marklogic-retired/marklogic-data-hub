package com.marklogic.hub.security;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.Role;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.resource.security.RoleManager;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class DataHubOdbcUserTest extends AbstractHubCoreTest {

    @Test
    void verifyPrivilegeExists() {
        runAsAdmin();

        ManageClient manageClient = getHubConfig().getManageClient();
        String json = new RoleManager(manageClient).getPropertiesAsJson("data-hub-odbc-user");
        Role role = new DefaultResourceMapper(new API(manageClient)).readResource(json, Role.class);
        assertEquals(1, role.getPrivilege().size());
        assertEquals("odbc:eval", role.getPrivilege().get(0).getPrivilegeName());
        assertNull(role.getRole(), "This role isn't expected to inherit any other roles. That means " +
            "that by itself, it likely won't be able to see any other data. But the intent of this role is to " +
            "add it to a user that can already see data and now wants to access it via an ODBC app server.");
    }
}
