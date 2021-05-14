package com.marklogic.hub.impl;

import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class GetInstalledVersionTest extends AbstractHubCoreTest {

    @Test
    void dataHubIsInstalled() {
        final Versions versions = new Versions(getHubClient());
        String installedVersion = versions.getInstalledVersion();
        assertEquals(getHubConfig().getJarVersion(), installedVersion, "This is the happy path - when DH is " +
            "installed, we expect this to return the same version as that of the DH client");

        assertEquals(installedVersion, versions.getVersionFromViaLegacyRestExtension(getHubClient().getStagingClient()),
            "Per DHFPROD-7334, DHF 5.5 no longer forks a bunch of REST modules to support the 'ml:*' pattern. " +
                "However, the Versions class still makes use of ml:hubversion to determine the version of a DHF 4 " +
                "instance. So we need to ensure that the staging rewriter still supports that route.");
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
