package com.marklogic.hub.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.dataservices.SecurityService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class GetAuthoritiesTest extends AbstractSecurityTest {
    @Override
    protected String getRoleName() {
        return "data-hub-admin";
    }

    @Test
    public void testAdminGetAuthorities() {
        runAsUser("admin", "admin");
        final DatabaseClient stagingClient = adminHubConfig.newStagingClient(null);
        JsonNode response = SecurityService.on(stagingClient).getAuthorities();
        assertTrue(response.get("roles").isArray());
        assertTrue(response.get("authorities").isArray());
        assertTrue(response.get("authorities").toString().contains("canInstallDataHub"));
    }

    @Test
    public void testDataHubDeveloperGetAuthorities() {
        runAsUser("userBeingTested", "password");
        final DatabaseClient stagingClient = adminHubConfig.newStagingClient(null);
        JsonNode response = SecurityService.on(stagingClient).getAuthorities();
        assertTrue(response.get("roles").isArray());
        assertTrue(response.get("authorities").isArray());
        assertFalse(response.get("authorities").toString().contains("canInstallDataHub"));
    }
}
