/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.marklogic.quickstart.web;

import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubTestBase;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.service.ProjectManagerService;
import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.File;
import java.io.IOException;

public class BaseTestController extends HubTestBase {

    protected static final String PROJECT_PATH = "ye-olde-project";

    protected EnvironmentConfig envConfig;

    @Autowired
    private ProjectManagerService projectManagerService;

    protected void setEnvConfig(EnvironmentConfig envConfig) {

        ConnectionAuthenticationToken authenticationToken = new ConnectionAuthenticationToken("admin", "admin", "localhost", 1, "local");
        authenticationToken.setEnvironmentConfig(envConfig);
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }

    @Before
    public void baseSetUp() throws IOException {
        envConfig = new EnvironmentConfig(PROJECT_PATH, "local", "admin", "admin");
        setEnvConfig(envConfig);
        DataHub dh = DataHub.create(envConfig.getMlSettings());
        dh.initProject();
        projectManagerService.addProject(PROJECT_PATH);
    }

    @After
    public void baseTeardown() throws IOException {
        FileUtils.deleteDirectory(new File(PROJECT_PATH));
    }
}
