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
package com.marklogic.hub;

import com.marklogic.mgmt.ManageClient;
import org.apache.commons.lang3.StringUtils;

/**
 * Can parse the version string returned by the Manage API so that clients can determine if the version of MarkLogic
 * supports a particular capability.
 */
public class MarkLogicVersion {

    private final String versionString;
    private Integer major;
    private Integer minor;
    private boolean nightly;
    private String dateString;

    public MarkLogicVersion(String versionString) {
        this.versionString = versionString;
        parseMarkLogicVersionString(versionString);
    }

    public MarkLogicVersion(ManageClient manageClient) {
        versionString = getMarkLogicVersionString(manageClient);
        parseMarkLogicVersionString(versionString);
    }

    public boolean isNightly() {
        return nightly;
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

    public String getVersionString() {
        return versionString;
    }

    /*
     * The DHF 5.2.0 roles depend on granular privileges that are first available in ML 10.0-3.
     */
    public boolean isVersionCompatibleWith520Roles() {
        if (nightly) {
            return major >= 10;
        }

        return major > 10 || (major == 10 && minor >= 300);
    }

    /*
     * Users should be able to update amps on versions > 10.0-4.4
     */
    public boolean cannotUpdateAmps() {
        if (nightly) {
            return false;
        }

        return major == 10 && minor == 404;
    }

    /*
     * Compares current ML version with the minimum required version and fails immediately
     * if current ML version is lower than the minimum required version.
     */
    public boolean supportsDataHubFramework() {
        if (nightly) {
            return true;
        }

        return major > 10 || (major == 10 && minor >= 201) || (major == 9 && minor >= 1100);
    }

    /*
     * Range constraints from Entity Services weren't returned until ML 10.0-4
     */
    public boolean supportsRangeIndexConstraints() {
        if (nightly) {
            return major >= 10;
        }

        return major > 10 || (major == 10 && minor >= 400);
    }

    private void parseMarkLogicVersionString(String versionString) {
        try {
            int major = Integer.parseInt(versionString.replaceAll("([^.]+)\\..*", "$1"));
            int minor = 0;
            boolean isNightly = versionString.matches("[^-]+-(\\d{4})(\\d{2})(\\d{2})");

            if (isNightly) {
                this.dateString = versionString.replaceAll("[^-]+-(\\d{4})(\\d{2})(\\d{2})", "$1-$2-$3");
                this.nightly = true;
            }
            else {
                //Extract minor version in cases where versions is of type 9.0-6 or 9.0-6.2
                if (versionString.matches("^.*-(.+)\\..*")) {
                    minor = Integer.parseInt(versionString.replaceAll("^.*-(.+)\\..*", "$1"));
                }
                else if (versionString.matches("^.*-(.+)$")) {
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
                this.minor = Integer.parseInt(alteredString);
            }
            this.major = major;
        }
        catch (Exception e) {
            throw new RuntimeException("Unable to parse MarkLogic version string, cause: " + e.getMessage(), e);
        }
    }

    private String getMarkLogicVersionString(ManageClient manageClient) {
        try {
            return manageClient.getXml("/manage").getElementValue("/node()/c:version");
        }
        catch (Exception e) {
            throw new RuntimeException("Unable to get version of MarkLogic; cause: " + e.getMessage(), e);
        }
    }
}
