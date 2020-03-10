package com.marklogic.hub.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class DataHubEnvironmentManagerTest extends AbstractSecurityTest {

    @Override
    protected String getRoleName() {
        return "data-hub-environment-manager";
    }

    @Test
    public void task1InstallDataHub() {
        final String message = "The data-hub-environment-manager is allowed to have manage-admin and security so " +
            "that in any environment, it can be used to perform any DH operation (short of anything requiring " +
            "the admin role). In DHS, this role will be used by DHS software to install DH without having to " +
            "use the admin user. On-premise, this role should only be used for an initial install of DH.";

        assertTrue(roleBeingTested.getRole().contains("manage-admin"), message);
        assertTrue(roleBeingTested.getRole().contains("security"), message);
    }
}
