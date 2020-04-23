package com.marklogic.hub.central.controllers.environment;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.ArtifactManager;
import com.marklogic.hub.artifact.ArtifactTypeInfo;
import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.controllers.EnvironmentController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;

import java.util.List;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;

public class EnvironmentControllerTest extends AbstractHubCentralTest {

    @Autowired
    EnvironmentController environmentController;

    @Autowired
    Environment environment;

    @Test
    public void testManageAdminAndSecurityAuthoritiesForArtifacts() {
        runAsUser(testConstants.ENVIRONMENT_MANAGER_USERNAME, testConstants.ENVIRONMENT_MANAGER_PASSWORD);
        List<ArtifactTypeInfo> listTypeInfo = ArtifactManager.on(getHubConfig()).getArtifactTypeInfoList();
        for (ArtifactTypeInfo typeInfo : listTypeInfo) {
            assertTrue(typeInfo.getUserCanUpdate());
            assertTrue(typeInfo.getUserCanRead());
        }
    }

    @Test
    public void testAdminAuthoritiesForArtifacts() {
        runAsAdmin();
        List<ArtifactTypeInfo> listTypeInfo = ArtifactManager.on(getHubConfig()).getArtifactTypeInfoList();
        for (ArtifactTypeInfo typeInfo : listTypeInfo) {
            assertTrue(typeInfo.getUserCanUpdate());
            assertFalse(typeInfo.getUserCanRead(), "admin would not allow read but write for deployment!");
        }
    }

    @Test
    void testGetProjectInfo() {
        JsonNode resp = environmentController.getProjectInfo();
        assertNotNull(resp);
        assertNotNull(resp.get("dataHubVersion"));
        assertNotNull(resp.get("projectName"));
        assertNotNull(resp.get("marklogicVersion"));
    }

    @Test
    public void getInfo() {
        String expectedTimeout = environment.getProperty("server.servlet.session.timeout");
        String actualTimeout = Objects.requireNonNull(environmentController.getInfo().getBody()).get("session.timeout");
        assertEquals(expectedTimeout, actualTimeout);
    }
}
