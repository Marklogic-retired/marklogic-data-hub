/*
 * Copyright 2012-2021 MarkLogic Corporation
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
package com.marklogic.hub.central.controllers;

import com.marklogic.hub.central.HubCentral;
import com.marklogic.hub.hubcentral.HubCentralManager;
import com.marklogic.hub.impl.DataHubImpl;
import com.marklogic.hub.impl.VersionInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.OutputStream;

@Controller
public class EnvironmentController extends BaseController {

    @Autowired
    HubCentral hubCentral;

    @Autowired
    Environment environment;

    @RequestMapping(value = "/api/environment/downloadHubCentralFiles", produces = "application/zip", method = RequestMethod.GET)
    @Secured("ROLE_downloadProjectFiles")
    public void downloadProjectUpdatesFilesAsZip(HttpServletResponse response) {
        response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        response.addHeader("Content-Disposition", "attachment; filename=datahub-hub-central-files.zip");
        try (OutputStream out = response.getOutputStream()) {
            new HubCentralManager().writeHubCentralFilesAsZip(getHubClient(), out);
            response.flushBuffer();
        } catch (IOException e) {
            throw new RuntimeException("Unable to download project; cause: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/api/environment/downloadProjectFiles", produces = "application/zip", method = RequestMethod.GET)
    @Secured("ROLE_downloadProjectFiles")
    public void downloadProjectFilesAsZip(HttpServletResponse response) {
        response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        response.addHeader("Content-Disposition", "attachment; filename=datahub-project-files.zip");
        try (OutputStream out = response.getOutputStream()) {
            new HubCentralManager().writeProjectFilesAsZip(getHubClient(), out);
            response.flushBuffer();
        } catch (IOException e) {
            throw new RuntimeException("Unable to download project; cause: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/api/environment/clearUserData", method = RequestMethod.POST)
    @Secured("ROLE_clearUserData")
    public ResponseEntity<Void> clearUserData() {
        new DataHubImpl(getHubClient()).clearUserData();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/api/environment/systemInfo", method = RequestMethod.GET)
    @ResponseBody
    public SystemInfo getSystemInfo(HttpSession session) {
        VersionInfo versionInfo = VersionInfo.newVersionInfo(getHubClient());
        SystemInfo info = new SystemInfo();
        info.serviceName = versionInfo.getClusterName();
        info.dataHubVersion = versionInfo.getHubVersion();
        info.marklogicVersion = versionInfo.getMarkLogicVersion();
        info.host = hubCentral.getHost();
        info.pendoKey = "dummy-key-f7d836d7-2afa-40a6-44e4-f32f58cb35a";
        info.sessionTimeout = environment.getProperty("server.servlet.session.timeout");
        Object hubCentralSessionToken = session.getAttribute("hubCentralSessionToken");
        if (hubCentralSessionToken != null) {
            info.sessionToken = hubCentralSessionToken.toString();
        }
        return info;
    }

    public static class SystemInfo {
        public String serviceName;
        public String dataHubVersion;
        public String marklogicVersion;
        public String host;
        public String sessionTimeout;
        public String sessionToken;
        public String pendoKey;
    }
}


