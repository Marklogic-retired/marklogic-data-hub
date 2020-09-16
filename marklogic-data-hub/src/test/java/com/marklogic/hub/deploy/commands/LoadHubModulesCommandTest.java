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
package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.modules.LoadModulesCommand;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.impl.Versions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class LoadHubModulesCommandTest extends AbstractHubCoreTest {

    @Autowired
    Versions versions;

    @Test
    public void verifyHubVersion() {
        final String message = "Jar version must match version in config.xqy/config.sjs after installation";

        assertEquals(getHubConfig().getJarVersion(), versions.getInstalledVersion(), message);
        assertEquals(getHubConfig().getJarVersion(), new Versions(getHubClient()).getInstalledVersion(), message);
        assertEquals(getHubConfig().getJarVersion(), new Versions(getHubConfig()).getInstalledVersion(), message);
    }

    @Test
    public void hubModulesShouldBeLoadedBeforeAllOtherModules() {
        assertTrue(
            new LoadHubModulesCommand().getExecuteSortOrder() < new LoadModulesCommand().getExecuteSortOrder(),
            "Hub modules need to be loaded before all other modules so that the DHF-specific REST " +
                "rewriter is guaranteed to be loaded before any calls are made to /v1/config/* for " +
                "loading REST extensions");
    }
}
