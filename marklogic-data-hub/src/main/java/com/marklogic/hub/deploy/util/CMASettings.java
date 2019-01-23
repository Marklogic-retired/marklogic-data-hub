package com.marklogic.hub.deploy.util;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.hub.impl.Versions;

public class CMASettings {
    private String mlVersion = null;
    private static CMASettings cmaSettings = null;

    public static synchronized CMASettings getInstance() {
        if (cmaSettings == null) {
            cmaSettings = new CMASettings();
        }
        return cmaSettings;
    }

    public void setCmaSettings(AppConfig appConfig) {
        if (mlVersion == null) {
            this.mlVersion = new Versions(appConfig).getMarkLogicVersion();
        }
        if (mlVersion.matches("^[9]\\.0-([56789]|[0-9]{2,})(\\.\\d+)?")) {
            appConfig.setDeployForestsWithCma(true);
            appConfig.setDeployPrivilegesWithCma(true);
            if (mlVersion.matches("^[9]\\.0-([6789]|[0-9]{2,})(\\.\\d+)?")) {
                appConfig.setDeployAmpsWithCma(true);
            }
        }
    }
}
