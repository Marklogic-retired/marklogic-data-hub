package com.marklogic.hub.security;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.Role;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.mapper.ResourceMapper;
import com.marklogic.mgmt.resource.security.RoleManager;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class VerifyHubCentralRolesTest extends AbstractHubCoreTest {

    @Test
    void verifyRoles(){
        verifyRole("hub-central-curator", "hub-central-flow-writer", "hub-central-load-writer", "hub-central-mapping-writer",
            "hub-central-custom-reader", "hub-central-entity-model-reader");
        verifyRole("hub-central-explorer",  "hub-central-saved-query-user", "hub-central-entity-exporter");
        verifyRole("hub-central-modeler","hub-central-entity-model-writer");
    }

    private void verifyRole(String roleName, String ... assignedRoles){
        runAsAdmin();
        RoleManager roleManager = new RoleManager(getHubClient().getManageClient());
        ResourceMapper resourceMapper = new DefaultResourceMapper(new API(getHubClient().getManageClient()));

        Role r = resourceMapper.readResource(roleManager.getAsJson(roleName), Role.class);
        assertNotNull(r);
        for(String role: assignedRoles){
            assertTrue(r.getRole().contains(role));
        }
    }
}
