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
package com.marklogic.hub.core;

import com.marklogic.client.admin.QueryOptionsManager;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.DataHubImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DataHubInstallTest extends AbstractHubCoreTest {

    @Autowired
    DataHub dataHub;

    @Test
    void unauthorizedUserTriesToInstall() {
        HubConfig hubConfig = new HubConfigImpl(getHubConfig().getHost(), "invalid", "invalid");
        RuntimeException ex = assertThrows(RuntimeException.class, () -> new DataHubImpl(hubConfig).isInstalled());
        assertTrue(ex.getMessage().startsWith("Unable to determine if Data Hub is already installed due to unauthorized user"),
            "Expecting error that identifies why the isInstalled check failed; message: " + ex.getMessage());
    }

    @Test
    public void testInstallHubModules() {
        Assumptions.assumeFalse(getHubConfig().getIsProvisionedEnvironment());
        assertTrue(dataHub.isInstalled().isInstalled());

        assertTrue(getModulesFile("/com.marklogic.hub/config.xqy").startsWith(getResource("data-hub-test/core-modules/config.xqy")));

        QueryOptionsManager jobsOptMgr = getHubClient().getJobsClient().newServerConfigManager().newQueryOptionsManager();
        StringHandle strJobssHandle = new StringHandle();
        jobsOptMgr.readOptions("jobs", strJobssHandle);
        assertTrue(strJobssHandle.get().length() > 0, "jobs options not installed");
        StringHandle strStagingHandle = new StringHandle();
        getHubClient().getStagingClient().newServerConfigManager().newQueryOptionsManager().readOptions("default", strStagingHandle);
        assertTrue(strStagingHandle.get().length() > 0, "staging options not installed");
        StringHandle strFinalHandle = new StringHandle();
        getHubClient().getFinalClient().newServerConfigManager().newQueryOptionsManager().readOptions("default", strFinalHandle);
        assertTrue(strFinalHandle.get().length() > 0, "final options not installed");
    }
}
