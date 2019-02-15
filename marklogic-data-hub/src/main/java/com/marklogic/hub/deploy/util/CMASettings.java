package com.marklogic.hub.deploy.util;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.hub.impl.Versions;
import org.apache.commons.lang3.StringUtils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.GregorianCalendar;

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

        int major = Integer.parseInt(mlVersion.replaceAll("([^.]+)\\..*", "$1"));

        boolean isNightly = mlVersion.matches("[^-]+-(\\d{4})(\\d{2})(\\d{2})");
        if (major == 9) {
            String alteredString = mlVersion.replaceAll("[^\\d]+", "");
            if (alteredString.length() < 4) {
                alteredString = StringUtils.rightPad(alteredString, 4, "0");
            }
            int ver = Integer.parseInt(alteredString.substring(0, 4));
            if (!isNightly && ver >= 9050 ) {
                appConfig.setDeployForestsWithCma(true);
                appConfig.setDeployPrivilegesWithCma(true);
            }
            if (!isNightly && ver >= 9060 ) {
                appConfig.setDeployAmpsWithCma(true);
            }
        }
        //Setting all true for nightly build after 07/01/2018
        if (isNightly) {
            String dateString = mlVersion.replaceAll("[^-]+-(\\d{4})(\\d{2})(\\d{2})", "$1-$2-$3");
            Date minDate = new GregorianCalendar(2018, 6, 1).getTime();
            Date date = null;
            try {
                date = new SimpleDateFormat("y-M-d").parse(dateString);
            } catch (ParseException e) {
                throw  new RuntimeException("Unable to set CMA settings for nightly build");
            }
            if (date.after(minDate)) {
                appConfig.setDeployForestsWithCma(true);
                appConfig.setDeployPrivilegesWithCma(true);
                appConfig.setDeployAmpsWithCma(true);
            }
        }
    }
}
