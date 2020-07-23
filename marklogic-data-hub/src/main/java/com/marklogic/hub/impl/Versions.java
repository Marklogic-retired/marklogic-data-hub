/*
 * Copyright (c) 2020 MarkLogic Corporation
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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.eval.ServerEvaluationCall;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.error.ServerValidationException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

@Component
public class Versions extends LoggingObject {

    @Autowired
    private HubConfig hubConfig;

    private HubClient hubClient;

    public Versions() {
        super();
    }

    public Versions(HubClient hubClient) {
        this.hubClient = hubClient;
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

    public Versions(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    /**
     * The DHF 5.2.0 roles depend on granular privileges that are first available in ML 10.0-3.
     *
     * @return
     */
    public boolean isVersionCompatibleWith520Roles() {
        Versions.MarkLogicVersion serverVersion = getMLVersion();
        if (serverVersion.isNightly()) {
            return (serverVersion.getMajor() == 10);
        }
        return (serverVersion.getMajor() == 10 && serverVersion.getMinor() >= 300);
    }

    /**
     * Depends on being able to obtain the version from an installed DH.
     *
     * @return
     */
    public String getInstalledVersion() {
        return getInstalledVersion(false);
    }

    /**
     * @param fallbackToLocalProject if true, and the version cannot be determined from the installed DH, will try to
     *                               determine the version of the local project
     * @return
     */
    public String getInstalledVersion(boolean fallbackToLocalProject) {
        try {
            DatabaseClient stagingClient = hubClient != null ? hubClient.getStagingClient() : hubConfig.newStagingClient();
            return getVersionFromRestEndpoint(stagingClient);
        } catch (Exception ex) {
            if (fallbackToLocalProject) {
                logger.warn("Unable to determine installed version, likely because DH is not yet installed: " + ex.getMessage());
                logger.warn("Will try to determine version from local project");
                return getLocalProjectVersion();
            } else {
                throw ex;
            }
        }
    }

    /**
     * We have to account for both ml:hubversion (DHF 4.3.x) and mlHubversion (DHF 5) because this method may be used
     * as part of updating a DHF 4.3.x instance. So in case we fail when using mlHubversion due to that endpoint not
     * existing, we use ml:hubversion instead.
     * <p>
     * Unfortunately, we don't have a way to write an automated test for this without removing mlHubversion and adding
     * ml:hubversion to the test modules database. So we are relying on manual testing for each new minor release,
     * which is reasonable as we know we have to support a 4.3.x to 5.x upgrade (at least as of 5.3.0).
     *
     * @param stagingClient
     * @return
     */
    private String getVersionFromRestEndpoint(DatabaseClient stagingClient) {
        try {
            return new HubVersionManager(stagingClient).getHubVersion();
        } catch (FailedRequestException fre) {
            String serverMessage = fre.getServerMessage();
            if (serverMessage != null && serverMessage.contains("Extension mlHubversion")) {
                logger.warn("Could not find mlHubversion REST endpoint; will try ml:hubversion REST endpoint to determine installed DHF version");
                return new LegacyHubVersionManager(stagingClient).getHubVersion();
            } else {
                throw fre;
            }
        }
    }

    public String getLocalProjectVersion() {
        String version = hubConfig != null ? determineVersionFromLocalProject(hubConfig.getHubProject()) : null;
        if (version == null) {
            version = "2.0.0";
            logger.warn("Unable to determine version from local project, will fallback to earliest known version: " + version);
        } else {
            logger.info("Local project version: " + version);
        }
        return version;
    }

    /**
     * As of 5.3.0, the only time this is needed is when QuickStart tries to determine if an upgrade is needed, but
     * DH is not installed yet. Previously, it was using mlDHFVersion, which depend on the user setting that property
     * correctly - though that still didn't guarantee that the project was updated. We now instead depend on the
     * project version being captured in the data-hub-admin.json file.
     *
     * @param hubProject
     * @return
     */
    protected String determineVersionFromLocalProject(HubProject hubProject) {
        File securityDir = hubProject.getHubSecurityDir().toFile();
        if (securityDir.exists()) {
            File rolesDir = new File(securityDir, "roles");
            if (rolesDir.exists()) {
                File roleFile = new File(rolesDir, "data-hub-admin.json");
                if (roleFile.exists()) {
                    try {
                        JsonNode role = new ObjectMapper().readTree(roleFile);
                        String description = role.get("description").asText();
                        int pos = description.indexOf(": Permits");
                        if (pos > -1) {
                            return description.substring(0, pos);
                        }
                    } catch (Exception ex) {
                        logger.warn("Unexpected error when trying to read local project version from data-hub-admin.json; cause: " + ex.getMessage());
                    }
                }
            }
        }
        return null;
    }

    public String getMarkLogicVersion() {
        // this call specifically needs to access marklogic without a known database
        DatabaseClient client = hubClient != null ?
            hubClient.getStagingClient() :
            hubConfig.getAppConfig().newAppServicesDatabaseClient(null);
        ServerEvaluationCall eval = client.newServerEval();
        String xqy = "xdmp:version()";
        try (EvalResultIterator result = eval.xquery(xqy).eval()) {
            if (result.hasNext()) {
                return result.next().getString();
            } else {
                throw new RuntimeException("Couldn't determine MarkLogic Version");
            }
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
            } else {
                //Extract minor version in cases where versions is of type 9.0-6 or 9.0-6.2
                if (versionString.matches("^.*-(.+)\\..*")) {
                    minor = Integer.parseInt(versionString.replaceAll("^.*-(.+)\\..*", "$1"));
                } else if (versionString.matches("^.*-(.+)$")) {
                    minor = Integer.parseInt(versionString.replaceAll("^.*-(.+)$", "$1"));
                }
                //left pad minor version with 0 if it is < 10
                String modifiedMinor = minor < 10 ? StringUtils.leftPad(String.valueOf(minor), 2, "0") : String.valueOf(minor);

                int hotFixNum = 0;

                //Extract hotfix in cases where versions is of type 9.0-6.2, if not it will be 0
                if (versionString.matches("^.*-(.+)\\.(.*)")) {
                    hotFixNum = Integer.parseInt(versionString.replaceAll("^.*-(.+)\\.(.*)", "$2"));
                }
                //left pad minor version with 0 if it is < 10
                String modifiedHotFixNum = hotFixNum < 10 ? StringUtils.leftPad(String.valueOf(hotFixNum), 2, "0") : String.valueOf(hotFixNum);
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

    public boolean isVersionCompatibleWithES() {
        final MarkLogicVersion mlVersion = getMLVersion();
        return isVersionCompatibleWithESNightly(mlVersion) || isVersionCompatibleWithESServer(mlVersion);
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
        if (!serverVersion.isNightly()) {
            return ((serverVersion.getMajor() == 10 && serverVersion.getMinor() >= 200) ||
                (serverVersion.getMajor() == 9 && serverVersion.getMinor() >= 1100));
        }
        return false;
    }

    public static int compare(String v1, String v2) {
        if (v1 == null || v2 == null) {
            return 1;
        }
        String[] v1Parts = v1.split("\\.");
        String[] v2Parts = v2.split("\\.");
        int length = Math.max(v1Parts.length, v2Parts.length);
        for (int i = 0; i < length; i++) {
            int v1Part = i < v1Parts.length ? Integer.parseInt(v1Parts[i]) : 0;
            int v2Part = i < v2Parts.length ? Integer.parseInt(v2Parts[i]) : 0;

            if (v1Part < v2Part) {
                return -1;
            }

            if (v1Part > v2Part) {
                return 1;
            }
        }
        return 0;
    }
}

class HubVersionManager extends ResourceManager {

    public HubVersionManager(DatabaseClient client) {
        client.init("mlHubversion", this);
    }

    public String getHubVersion() {
        return getServices().get(new RequestParameters(), new StringHandle()).get();
    }
}

class LegacyHubVersionManager extends ResourceManager {
    public LegacyHubVersionManager(DatabaseClient client) {
        client.init("ml:hubversion", this);
    }

    public String getHubVersion() {
        return getServices().get(new RequestParameters(), new StringHandle()).get();
    }
}
