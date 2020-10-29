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
import com.marklogic.hub.MarkLogicVersion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;

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

    public Versions(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
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

    public String getMarkLogicVersionString() {
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

    public MarkLogicVersion getMarkLogicVersion() {
        return new MarkLogicVersion(this.getMarkLogicVersionString());
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
