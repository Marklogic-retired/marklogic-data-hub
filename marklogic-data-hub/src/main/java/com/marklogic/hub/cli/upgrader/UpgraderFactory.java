package com.marklogic.hub.cli.upgrader;

import java.util.Arrays;
import java.util.List;

/**
 * TODO Can convert this into a Spring bean, just hacking for now.
 */
public class UpgraderFactory {

    public static Upgrader newUpgrader(String existingVersion) {
        if ("5.0.0".equals(existingVersion)) {
            return new Version500Upgrader();
        }
        throw new IllegalArgumentException("Unsupported existing version: " + existingVersion);
    }

    public static List<Upgrader> getUpgraders() {
        return Arrays.asList(new Version500Upgrader());
    }
}
