/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.impl;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.ServerValidationException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

@Component
public class Versions extends ResourceManager {
    private static final String NAME = "ml:hubversion";

    DatabaseClient stagingClient;
    private AppConfig appConfig;

    @Autowired
    private HubConfig hubConfig;

    public Versions() {
        super();
    }

    public class MarkLogicVersion {
        private Integer major;
        private Integer minor;
        private boolean isNightly;
        private String dateString;

        public boolean isNightly() {
            return isNightly;
        }

        public Integer getMajor() {
            return major;
        }

        public Integer getMinor() {
            return minor;
        }

        public String getDateString() {
            return dateString;
        }
    }

    /**
     * Needed for the Gradle tasks.
     *
     * @param hubConfig HubConfig
     */
    public Versions(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.appConfig = hubConfig.getAppConfig();
    }

    /**
     * Needed for the Gradle tasks.
     *
     * @param appConfig AppConfig
     */
    public Versions(AppConfig appConfig) {
        this.appConfig = appConfig;
    }

    public void setupClient() {
        this.stagingClient = hubConfig.newStagingClient();
        this.stagingClient.init(NAME, this);
    }

    public String getDHFVersion() {
        return (hubConfig != null) ? hubConfig.getDHFVersion() : null;
    }

    public String getHubVersion() {
        try {
            ResourceServices.ServiceResultIterator resultItr = this.getServices().get(new RequestParameters());
            if (resultItr == null || ! resultItr.hasNext()) {
                return null;
            }
            ResourceServices.ServiceResult res = resultItr.next();
            return res.getContent(new StringHandle()).get();
        }
        catch(Exception e) {}

        /* 2.0.0 is the version at which we started using this method. First we'll check the version gradle properties.
         * If the version isn't there, we'll assume 2.0.0
         */
        String dhfVersion = this.getDHFVersion();
        if (dhfVersion == null || "".equals(dhfVersion)) {
            return "2.0.0";
        } else {
            return dhfVersion;
        }
    }

    public String getMarkLogicVersion() {
        if (this.appConfig == null) {
            this.appConfig = hubConfig.getAppConfig();
        }
        // this call specifically needs to access marklogic without a known database
        ServerEvaluationCall eval = appConfig.newAppServicesDatabaseClient(null).newServerEval();
        String xqy = "xdmp:version()";
        EvalResultIterator result = eval.xquery(xqy).eval();
        if (result.hasNext()) {
            return result.next().getString();
        }
        else {
            throw new RuntimeException("Couldn't determine MarkLogic Version");
        }
    }

    public MarkLogicVersion getMLVersion() {
        String versionString = this.getMarkLogicVersion();
        return getMLVersion(versionString);

    }

    public MarkLogicVersion getMLVersion(String versionString) {
        MarkLogicVersion markLogicVersion = new MarkLogicVersion();
        try {
            if (versionString == null) {
                versionString = this.getMarkLogicVersion();
            }
            int major = Integer.parseInt(versionString.replaceAll("([^.]+)\\..*", "$1"));
            int minor = 0;
            boolean isNightly = versionString.matches("[^-]+-(\\d{4})(\\d{2})(\\d{2})");

            if (isNightly) {
                String dateString = versionString.replaceAll("[^-]+-(\\d{4})(\\d{2})(\\d{2})", "$1-$2-$3");
                markLogicVersion.dateString = dateString;
                markLogicVersion.isNightly = true;
            }
            else {
                //Extract minor version in cases where versions is of type 9.0-6 or 9.0-6.2
                if(versionString.matches("^.*-(.+)\\..*")) {
                    minor = Integer.parseInt(versionString.replaceAll("^.*-(.+)\\..*", "$1"));
                }
                else if(versionString.matches("^.*-(.+)$")){
                    minor = Integer.parseInt(versionString.replaceAll("^.*-(.+)$", "$1"));
                }
                //left pad minor version with 0 if it is < 10
                String modifiedMinor = minor < 10 ? StringUtils.leftPad(String.valueOf(minor), 2, "0"):String.valueOf(minor) ;

                int hotFixNum = 0;

                //Extract hotfix in cases where versions is of type 9.0-6.2, if not it will be 0
                if(versionString.matches("^.*-(.+)\\.(.*)")) {
                    hotFixNum = Integer.parseInt(versionString.replaceAll("^.*-(.+)\\.(.*)", "$2"));
                }
                //left pad minor version with 0 if it is < 10
                String modifiedHotFixNum = hotFixNum < 10 ? StringUtils.leftPad(String.valueOf(hotFixNum), 2, "0"):String.valueOf(hotFixNum) ;
                String alteredString = StringUtils.join(modifiedMinor, modifiedHotFixNum);
                int ver = Integer.parseInt(alteredString);
                markLogicVersion.minor = ver;
            }
            markLogicVersion.major = major;
        } catch (Exception e) {
            throw new ServerValidationException(e.toString());
        }
        return markLogicVersion;

    }

    public boolean isVersionCompatibleWithES(){
        return  isVersionCompatibleWithESNightly(getMLVersion()) || isVersionCompatibleWithESServer(getMLVersion());
    }

    private boolean isVersionCompatibleWithESNightly(Versions.MarkLogicVersion serverVersion) {
        if (serverVersion.isNightly()) {
            try {
                if (serverVersion.getMajor() == 9) {
                    Date minDate = new GregorianCalendar(2019, Calendar.AUGUST, 24).getTime();
                    Date date = new SimpleDateFormat("y-M-d").parse(serverVersion.getDateString());
                    if (date.before(minDate)) {
                        return false;
                    }
                }
                //Support all 10.0-nightly on or after 6/11/2019
                if (serverVersion.getMajor() == 10) {
                    Date minDate = new GregorianCalendar(2019, Calendar.AUGUST, 24).getTime();
                    Date date = new SimpleDateFormat("y-M-d").parse(serverVersion.getDateString());
                    if (date.before(minDate)) {
                        return false;
                    }
                }
            } catch (Exception e) {
                return false;
            }
            return true;
        }
        return false;
    }

    private boolean isVersionCompatibleWithESServer(Versions.MarkLogicVersion serverVersion) {
        if(!serverVersion.isNightly()) {
            return ((serverVersion.getMajor() == 10 && serverVersion.getMinor() >= 200) ||
                (serverVersion.getMajor() == 9 && serverVersion.getMinor() >= 1002));
        }
        return false;
    }

    public static int compare(String v1, String v2) {
        if(v1 == null || v2 == null) {
            return 1;
        }
        String[] v1Parts = v1.split("\\.");
        String[] v2Parts = v2.split("\\.");
        int length = Math.max(v1Parts.length, v2Parts.length);
        for(int i = 0; i < length; i++) {
            int v1Part = i < v1Parts.length ? Integer.parseInt(v1Parts[i]) : 0;
            int v2Part = i < v2Parts.length ? Integer.parseInt(v2Parts[i]) : 0;

            if(v1Part < v2Part) {
                return -1;
            }

            if(v1Part > v2Part) {
                return 1;
            }
        }
        return 0;
    }
}
