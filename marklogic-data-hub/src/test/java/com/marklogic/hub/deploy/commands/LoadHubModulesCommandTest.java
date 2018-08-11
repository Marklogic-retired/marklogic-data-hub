package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.util.Versions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static junit.framework.TestCase.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class LoadHubModulesCommandTest extends HubTestBase {

    private static Logger logger = LoggerFactory.getLogger(LoadHubModulesCommandTest.class);

    LoadHubModulesCommand loadHubModulesCommand;
    CommandContext commandContext;
    HubConfig config;

    @BeforeEach
    public void setup() {
        createProjectDir();
        config = getHubConfig();
        loadHubModulesCommand = new LoadHubModulesCommand(config);
        commandContext = new CommandContext(config.getAppConfig(), null, null);
    }

    @Test
    public void ensureHubFourLoaded() {
        loadHubModulesCommand.execute(commandContext);

        String jarVersion = config.getJarVersion();

        Versions versions = new Versions(config);

        logger.info(jarVersion);

        // this test will work until major version 10
        assertTrue("Jar version must be greater than 4", jarVersion.compareTo("4.0.0") >= 0);
        assertEquals(jarVersion, versions.getHubVersion(),
            "Jar version must match version in config.xqy/config.sjs after installation");

    }
}
