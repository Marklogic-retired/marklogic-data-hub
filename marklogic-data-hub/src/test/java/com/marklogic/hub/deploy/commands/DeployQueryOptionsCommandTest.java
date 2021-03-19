package com.marklogic.hub.deploy.commands;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class DeployQueryOptionsCommandTest extends AbstractHubCoreTest {

    @Test
    void test() {
        clearUserModules();
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubProject.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubProject.FINAL_ENTITY_QUERY_OPTIONS_FILE));

        new DeployQueryOptionsCommand(getHubConfig()).execute(newCommandContext());
        assertNotNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubProject.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        assertNotNull(getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubProject.FINAL_ENTITY_QUERY_OPTIONS_FILE));
    }
}
