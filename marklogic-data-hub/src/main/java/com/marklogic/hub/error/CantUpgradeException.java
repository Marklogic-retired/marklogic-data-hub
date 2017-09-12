package com.marklogic.hub.error;

public class CantUpgradeException extends Exception {

    public CantUpgradeException(String version, String minVersion) {
        super("Can't upgrade hub version " + version + ". Minimum version that can be upgraded is " + minVersion);
    }
}
