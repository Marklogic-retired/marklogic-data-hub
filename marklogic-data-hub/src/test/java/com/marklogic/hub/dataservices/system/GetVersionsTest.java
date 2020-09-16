package com.marklogic.hub.dataservices.system;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.impl.VersionInfo;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class GetVersionsTest extends AbstractHubCoreTest {

    @Test
    void test() {
        runAsDataHubOperator();

        DatabaseClient stagingClient = getHubClient().getStagingClient();
        final String expectedMarkLogicVersion = stagingClient.newServerEval().javascript("xdmp.version()").evalAs(String.class);
        final String expectedHubClientVersion = getHubConfig().getJarVersion();
        final String expectedClusterName = stagingClient.newServerEval().javascript("xdmp.clusterName()").evalAs(String.class);

        VersionInfo versionInfo = VersionInfo.newVersionInfo(getHubClient());
        assertEquals(expectedHubClientVersion, versionInfo.getHubVersion(),
            "The version from HubClient, which is obtained from version.properties in the DH jar, " +
                "should match the DH version reported by the endpoint");
        assertEquals(expectedMarkLogicVersion, versionInfo.getMarkLogicVersion());
        assertEquals(expectedClusterName, versionInfo.getClusterName());
    }
}
