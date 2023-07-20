/*
 * Copyright (c) 2021 MarkLogic Corporation
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

import java.text.SimpleDateFormat;
import java.util.Date;

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
     * Compares current ML version with the minimum required version and fails immediately
     * if current ML version is lower than the minimum required version.
     */
    public boolean supportsDataHubFramework() {
        if (nightly && major >= 10) {
            return true;
        }

        return major >= 11 || (major == 10 && minor >= 1000);
    }

    private void parseMarkLogicVersionString(String version) {
        String[] versionArr = version.split("[.-]");

        this.major = Integer.parseInt(versionArr[0]);
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd");
            SimpleDateFormat outputFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date date = dateFormat.parse(versionArr[2]);

            this.nightly = true;
            this.dateString = outputFormat.format(date);
            return;
        } catch (Exception e) {
            this.nightly = false;
        }

        int minor, patch;
        if(major <= 10) {
            minor = versionArr.length > 2 ? Integer.parseInt(versionArr[2]) : 0;
            patch = versionArr.length > 3 ? Integer.parseInt(versionArr[3]) : 0;
        } else {
            minor = versionArr.length > 1 ? Integer.parseInt(versionArr[1]) : 0;
            patch = versionArr.length > 2 ? Integer.parseInt(versionArr[2]) : 0;
        }
        this.minor = minor * 100 + patch;
    }

    private String getMarkLogicVersionString(ManageClient manageClient) {
        try {
            return manageClient.getXml("/manage/LATEST/?format=xml").getElementValue("/node()/c:version");
        }
        catch (Exception e) {
            throw new RuntimeException("Unable to get version of MarkLogic; cause: " + e.getMessage(), e);
        }
    }
}
