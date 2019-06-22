package com.marklogic.hub.impl;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.CmaConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.deploy.commands.LoadUserArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class DhsInstallTest extends HubTestBase {

    @Test
    public void prepareAppConfig() {
        AppConfig appConfig = new AppConfig();
        assertTrue(appConfig.isCreateForests(), "AppConfig should default to creating forests");
        assertNull(appConfig.getResourceFilenamesIncludePattern());

        new DataHubImpl().prepareAppConfigForInstallingIntoDhs(appConfig);

        assertFalse(appConfig.isCreateForests(), "DHS handles forest creation");
        assertEquals("(staging|final|job)-database.json", appConfig.getResourceFilenamesIncludePattern().pattern(),
            "As DHS is only updating databases, we can get away with specifying a global include pattern, as " +
                "databases are the resources being updated. Once we start deploying other resources, we won't be able " +
                "to use a global pattern. We'll instead need to do something similar to what " +
                "DhsDeployServersCommand does.");

        final String message = "CMA doesn't work for some resources prior to ML 9.0-9, so turning off CMA usage for those " +
            "just to be safe for DHS";
        CmaConfig cmaConfig = appConfig.getCmaConfig();
        assertFalse(cmaConfig.isCombineRequests(), message);
        assertFalse(cmaConfig.isDeployDatabases(), message);
        assertFalse(cmaConfig.isDeployRoles(), message);
        assertFalse(cmaConfig.isDeployUsers(), message);
    }

    @Test
    public void buildCommandList() {
        List<Command> commands = dataHub.buildCommandListForInstallingIntoDhs();
        assertTrue(commands.get(0) instanceof DeployOtherDatabasesCommand);
        assertTrue(commands.get(1) instanceof LoadUserArtifactsCommand);
        assertTrue(commands.get(2) instanceof LoadUserModulesCommand);
        assertEquals(3, commands.size());
    }
}
