/*
 * Copyright 2012-2019 MarkLogic Corporation
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
import com.marklogic.appdeployer.command.modules.LoadModulesCommand;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.mgmt.ManageClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;


@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class LoadHubModulesCommandTest extends HubTestBase {

    private static Logger logger = LoggerFactory.getLogger(LoadHubModulesCommandTest.class);

    LoadHubModulesCommand loadHubModulesCommand;
    CommandContext commandContext;

    @BeforeEach
    public void setup() {
        createProjectDir();
        loadHubModulesCommand = new LoadHubModulesCommand();
        loadHubModulesCommand.setHubConfig(adminHubConfig);
        //ManageClient manageClient = new ManageClient(new com.marklogic.mgmt.ManageConfig(host, 8002, secUser, secPassword));
        commandContext = new CommandContext(adminHubConfig.getAppConfig(), adminHubConfig.getManageClient(), null);
    }

    @Test
    public void ensureHubFourLoaded() {
        loadHubModulesCommand.execute(commandContext);

        String jarVersion = adminHubConfig.getJarVersion();


        //logger.info(jarVersion);

        // this test will work until major version 10
        assertTrue(jarVersion.charAt(0) >= '4');
        assertEquals(jarVersion, versions.getHubVersion(),
            "Jar version must match version in config.xqy/config.sjs after installation");

    }

    @Test
    public void hubModulesShouldBeLoadedBeforeAllOtherModules() {
        LoadModulesCommand loadModulesCommand = new LoadModulesCommand();
        assertTrue(
            loadHubModulesCommand.getExecuteSortOrder() < loadModulesCommand.getExecuteSortOrder(),
            "Hub modules need to be loaded before all other modules so that the DHF-specific REST " +
                "rewriter is guaranteed to be loaded before any calls are made to /v1/config/* for " +
                "loading REST extensions");
    }
}
