/*
 * Copyright 2012-2019 MarkLogic Corporation
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

package com.marklogic.hub.web.web;

import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.web.auth.ConnectionAuthenticationToken;
import com.marklogic.hub.web.service.ProjectManagerService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

public class BaseTestController extends HubTestBase implements InitializingBean {

    protected static final String PROJECT_PATH = "ye-olde-project";
    @Autowired
    private ProjectManagerService projectManagerService;

    @Autowired
    private DataHub dh;

    protected void setEnvConfig() {
        ConnectionAuthenticationToken authenticationToken = new ConnectionAuthenticationToken("admin", "admin", adminHubConfig.getHost(), 1, "local");
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }

    public void afterPropertiesSet() throws Exception {
        super.afterPropertiesSet();
        setEnvConfig();
        installHubModules();
    }


    @BeforeEach
    public void baseSetUp() throws IOException {
        setEnvConfig();
        dh.initProject();
        projectManagerService.addProject(PROJECT_PATH);
        adminHubConfig.refreshProject();
    }

    @AfterEach
    public void baseTeardown() throws IOException {
        deleteProjectDir();
    }
}
