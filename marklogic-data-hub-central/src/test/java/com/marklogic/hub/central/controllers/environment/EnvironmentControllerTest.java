package com.marklogic.hub.central.controllers.environment;

import com.marklogic.hub.ArtifactManager;
import com.marklogic.hub.artifact.ArtifactTypeInfo;
import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.controllers.EnvironmentController;
import com.marklogic.hub.impl.VersionInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class EnvironmentControllerTest extends AbstractHubCentralTest {

    @Autowired
    EnvironmentController environmentController;

    @Autowired
    Environment environment;

    @Test
    public void testManageAdminAndSecurityAuthoritiesForArtifacts() {
        runAsUser(testConstants.ENVIRONMENT_MANAGER_USERNAME, testConstants.ENVIRONMENT_MANAGER_PASSWORD);
        List<ArtifactTypeInfo> listTypeInfo = ArtifactManager.on(getHubClient()).getArtifactTypeInfoList();
        for (ArtifactTypeInfo typeInfo : listTypeInfo) {
            assertTrue(typeInfo.getUserCanUpdate());
            assertTrue(typeInfo.getUserCanRead());
        }
    }

    @Test
    public void testAdminAuthoritiesForArtifacts() {
        runAsAdmin();
        List<ArtifactTypeInfo> listTypeInfo = ArtifactManager.on(getHubClient()).getArtifactTypeInfoList();
        for (ArtifactTypeInfo typeInfo : listTypeInfo) {
            assertTrue(typeInfo.getUserCanUpdate());
            assertFalse(typeInfo.getUserCanRead(), "admin would not allow read but write for deployment!");
        }
    }

    @Test
    void getSystemInfo() {
        final VersionInfo versionInfo = VersionInfo.newVersionInfo(getHubClient());

        runAsTestUserWithRoles("hub-central-user");

        EnvironmentController.SystemInfo actualSystemInfo = environmentController.getSystemInfo();
        assertNotNull(actualSystemInfo);
        assertEquals(versionInfo.getHubVersion(), actualSystemInfo.dataHubVersion);
        assertEquals(versionInfo.getMarkLogicVersion(), actualSystemInfo.marklogicVersion);
        assertEquals(versionInfo.getClusterName(), actualSystemInfo.serviceName,
            "clusterName is called 'serviceName' in the HC context to provide an abstraction over where the " +
                "name is actually coming from, as it may not always be the name of the ML cluster");

        final String expectedTimeout = environment.getProperty("server.servlet.session.timeout");
        assertEquals(expectedTimeout, actualSystemInfo.sessionTimeout, "As part of DHFPROD-5200, this is being added so we can get rid of /api/info");
    }
}
