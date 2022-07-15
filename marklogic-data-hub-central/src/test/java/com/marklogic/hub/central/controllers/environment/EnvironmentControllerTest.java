package com.marklogic.hub.central.controllers.environment;

import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.controllers.EnvironmentController;
import com.marklogic.hub.impl.VersionInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.mock.web.MockHttpSession;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class EnvironmentControllerTest extends AbstractHubCentralTest {

    @Autowired
    EnvironmentController environmentController;

    @Autowired
    Environment environment;

    @Test
    void getSystemInfo() {
        final VersionInfo versionInfo = VersionInfo.newVersionInfo(getHubClient());

        runAsTestUserWithRoles("hub-central-user");

        EnvironmentController.SystemInfo actualSystemInfo = environmentController.getSystemInfo(new MockHttpSession());
        assertNotNull(actualSystemInfo);
        assertEquals(versionInfo.getHubVersion(), actualSystemInfo.dataHubVersion);
        assertEquals(versionInfo.getMarkLogicVersion(), actualSystemInfo.marklogicVersion);
        assertEquals(versionInfo.getStagingDbName(), actualSystemInfo.stagingDb);
        assertEquals(versionInfo.getFinalDbName(), actualSystemInfo.finalDb);
        assertEquals(versionInfo.getJobsDbName(), actualSystemInfo.jobsDb);

        assertEquals(versionInfo.getClusterName(), actualSystemInfo.serviceName,
            "clusterName is called 'serviceName' in the HC context to provide an abstraction over where the " +
                "name is actually coming from, as it may not always be the name of the ML cluster");

        final String expectedTimeout = environment.getProperty("server.servlet.session.timeout");
        assertEquals(expectedTimeout, actualSystemInfo.sessionTimeout, "As part of DHFPROD-5200, this is being added so we can get rid of /api/info");
    }
}
