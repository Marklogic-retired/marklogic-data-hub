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

package com.marklogic.hub.web.service;

import com.marklogic.client.document.DocumentPage;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.web.WebApplication;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.junit.Assert.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {WebApplication.class, ApplicationConfig.class, FlowManagerServiceTest.class})
class FlowManagerServiceTest extends AbstractServiceTest {

    private static String FLOW = "testFlow";
    private static Path projectDir = Paths.get(".", PROJECT_PATH);

    @Autowired
    FlowManagerService flowManagerService;

    @Autowired
    HubConfigImpl hubConfig;

    @BeforeEach
    void setUp() {
        createProjectDir();
        hubConfig.initHubProject();
        hubConfig.refreshProject();

        Path flowDir = projectDir.resolve("flows");

        FileUtil.copy(getResourceStream("flow-manager/flows/testFlow.flow.json"), flowDir.resolve("testFlow.flow.json").toFile());

        installUserModules(getDataHubAdminConfig(), true);
    }

    @AfterEach
    void teardownProject() {
        clearUserModules();
        deleteProjectDir();
    }

    @Test
    void deleteFlow() throws InterruptedException {
        List<String> flowList = flowManagerService.getFlowNames();
        assertEquals(1, flowList.size());

        flowManagerService.deleteFlow(FLOW);

        flowList = flowManagerService.getFlowNames();
        assertEquals(0, flowList.size());

        // Adding sleep to delete artifacts from the db via async call
        Thread.sleep(1000);

        DocumentPage doc = stagingDocMgr.read("/flows/" + FLOW + ".flow.json");
        assertFalse(doc.hasNext());
        doc = finalDocMgr.read("/flows/" + FLOW + ".flow.json");
        assertFalse(doc.hasNext());
    }
}
