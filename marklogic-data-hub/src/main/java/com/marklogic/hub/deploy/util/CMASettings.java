package com.marklogic.hub.deploy.util;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.CmaConfig;
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
        CmaConfig cmaConfig = new CmaConfig();

        int major = Integer.parseInt(mlVersion.replaceAll("([^.]+)\\..*", "$1"));

        boolean isNightly = mlVersion.matches("[^-]+-(\\d{4})(\\d{2})(\\d{2})");
        int minor = 0;
        int hotFixNum = 0;

        //Extract minor version in cases where versions is of type 9.0-6.2 or 9.0-6
        if(mlVersion.matches("^.*-(.+)\\.(.*)")) {
            minor = Integer.parseInt(mlVersion.replaceAll("^.*-(.+)\\..*", "$1"));
            hotFixNum = Integer.parseInt(mlVersion.replaceAll("^.*-(.+)\\.(.*)", "$2"));
        }
        else if(mlVersion.matches("^.*-(.+)$")){
            minor = Integer.parseInt(mlVersion.replaceAll("^.*-(.+)$", "$1"));
        }
        //left pad minor version with 0 if it is < 10
        String modifiedMinor = minor < 10 ? StringUtils.leftPad(String.valueOf(minor), 2, "0"):String.valueOf(minor) ;

        //left pad hotFixNum  with 0 if it is < 10
        String modifiedHotFixNum = hotFixNum < 10 ? StringUtils.leftPad(String.valueOf(hotFixNum), 2, "0"):String.valueOf(hotFixNum) ;
        String alteredString = StringUtils.join(modifiedMinor, modifiedHotFixNum);
        int ver = Integer.parseInt(alteredString);

        //enable cma for forests and privileges for versions >= 9.0-5
        if (!isNightly && ver >= 500) {
            cmaConfig.setDeployForests(true);
            cmaConfig.setDeployPrivileges(true);
        }
        //enable cma for forests and privileges for versions >= 9.0-6
        if (!isNightly && ver >= 600 ) {
            cmaConfig.setDeployAmps(true);
        }
        //enable cma for everything except server for versions >= 9.0-9
        if (!isNightly && ver >= 900 ) {
            cmaConfig.enableAll();
            cmaConfig.setDeployServers(false);
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
                cmaConfig.setDeployForests(true);
                cmaConfig.setDeployPrivileges(true);
                cmaConfig.setDeployAmps(true);
            }
        }
        appConfig.setCmaConfig(cmaConfig);
    }
}
