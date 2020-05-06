package com.marklogic.hub.dataservices.system;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.impl.VersionInfo;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class GetVersionsTest extends AbstractHubCoreTest {

    @Test
    void test() {
        runAsDataHubOperator();

        final String expectedMarkLogicVersion = getHubClient().getStagingClient().newServerEval().javascript("xdmp.version()").evalAs(String.class);
        final String expectedHubClientVersion = adminHubConfig.getJarVersion();

        VersionInfo versionInfo = VersionInfo.newVersionInfo(getHubClient());
        assertEquals(expectedHubClientVersion, versionInfo.getHubVersion(),
            "The version from HubClient, which is obtained from version.properties in the DH jar, " +
                "should match the DH version reported by the endpoint");
        assertEquals(expectedMarkLogicVersion, versionInfo.getMarkLogicVersion());
    }
}
