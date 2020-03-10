package com.marklogic.hub.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class DataHubPortalSecurityAdminTest extends AbstractSecurityTest {

    @Override
    protected String getRoleName() {
        return "data-hub-portal-security-admin";
    }

    @Test
    public void task4ConfigureExternalSecurity() {
        final String message = "It is currently assumed that it's fine for this DHS-specific role to have the " +
            "manage-admin and security roles; if not, new granular privileges will be needed to support managing " +
            "external security resources without those roles";

        assertTrue(roleBeingTested.getRole().contains("manage-admin"), message);
        assertTrue(roleBeingTested.getRole().contains("security"), message);
    }
}
