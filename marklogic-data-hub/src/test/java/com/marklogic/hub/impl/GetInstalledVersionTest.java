package com.marklogic.hub.impl;

import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class GetInstalledVersionTest extends AbstractHubCoreTest {

    @Test
    void dataHubIsInstalled() {
        String installedVersion = new Versions(getHubClient()).getInstalledVersion();
        assertEquals(getHubConfig().getJarVersion(), installedVersion, "This is the happy path - when DH is " +
            "installed, we expect this to return the same version as that of the DH client");
    }

    @Test
    void fallbackToLocalProject() {
        final String jarVersion = getHubConfig().getJarVersion();
        try {
            // Force an error to occur
            getHubConfig().setMlPassword("incorrect");
            String installedVersion = new Versions(getHubConfig()).getInstalledVersion(true);
            assertEquals(jarVersion, installedVersion, "When the version can't be determined from an installed DH, " +
                "Versions is expected to fallback to the local project. It does so by checking the description property " +
                "of the data-hub-admin.json file, as the project version is expected to be stored in the beginning of the " +
                "description value.");
        } finally {
            runAsFlowDeveloper();
        }
    }
}
