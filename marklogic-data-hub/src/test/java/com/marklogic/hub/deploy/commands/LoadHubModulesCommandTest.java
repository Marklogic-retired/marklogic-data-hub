/*
 * Copyright 2012-2018 MarkLogic Corporation
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

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.security.DeployAmpsCommand;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.util.Versions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;


public class LoadHubModulesCommandTest extends HubTestBase {

    private static Logger logger = LoggerFactory.getLogger(LoadHubModulesCommandTest.class);

    LoadHubModulesCommand loadHubModulesCommand;
    CommandContext commandContext;
    HubConfig config;

    @BeforeEach
    public void setup() {
        createProjectDir();
        config = getHubAdminConfig();
        loadHubModulesCommand = new LoadHubModulesCommand(config);
        commandContext = new CommandContext(config.getStagingAppConfig(), manageClient, null);
    }

    @Test
    public void ensureHubFourLoaded() {
        loadHubModulesCommand.execute(commandContext);

        String jarVersion = config.getJarVersion();

        Versions versions = new Versions(config);

        logger.info(jarVersion);

        // this test will work until major version 10
        assertTrue(jarVersion.compareTo("4.0.1") >= 0);
        assertEquals(jarVersion, versions.getHubVersion(),
            "Jar version must match version in config.xqy/config.sjs after installation");

    }

}
