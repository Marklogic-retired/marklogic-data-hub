package com.marklogic.hub.impl;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.CmaConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.deploy.commands.LoadUserArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class DhsInstallTest extends HubTestBase {

    private AppConfig originalAppConfig;

    @BeforeEach
    public void setup() {
        originalAppConfig = adminHubConfig.getAppConfig();
    }

    @AfterEach
    public void teardown() {
        adminHubConfig.setAppConfig(originalAppConfig);
    }

    @Test
    public void prepareAppConfig() {
        AppConfig appConfig = new AppConfig();
        assertTrue(appConfig.isCreateForests(), "AppConfig should default to creating forests");
        assertNull(appConfig.getResourceFilenamesIncludePattern());

        adminHubConfig.setAppConfig(appConfig);

        new DataHubImpl().prepareAppConfigForInstallingIntoDhs(adminHubConfig);

        assertEquals(adminHubConfig.getPort(DatabaseKind.STAGING), appConfig.getAppServicesPort(),
            "DHS does not allow access to the default App-Services port - 8000 - so it's set to the staging port instead so " +
                "that user modules can be loaded into the DHF modules database");

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
    public void knownPropertyValuesShouldBeFixed() {
        // Set these to custom values that a user may use on-premise
        HubConfigImpl hubConfig = new HubConfigImpl();
        hubConfig.setHttpName(DatabaseKind.STAGING, "my-staging-server");
        hubConfig.setHttpName(DatabaseKind.FINAL, "my-final-server");
        hubConfig.setHttpName(DatabaseKind.JOB, "my-job-server");
        hubConfig.setDbName(DatabaseKind.STAGING, "my-staging-db");
        hubConfig.setDbName(DatabaseKind.FINAL, "my-final-db");
        hubConfig.setDbName(DatabaseKind.JOB, "my-job-db");
        hubConfig.setDbName(DatabaseKind.MODULES, "my-modules-db");
        hubConfig.setDbName(DatabaseKind.STAGING_TRIGGERS, "my-staging-triggers");
        hubConfig.setDbName(DatabaseKind.STAGING_SCHEMAS, "my-staging-schemas");
        hubConfig.setDbName(DatabaseKind.FINAL_TRIGGERS, "my-final-triggers");
        hubConfig.setDbName(DatabaseKind.FINAL_SCHEMAS, "my-final-schemas");

        new DataHubImpl().setKnownValuesForDhsInstall(hubConfig);

        assertEquals(HubConfig.DEFAULT_STAGING_NAME, hubConfig.getHttpName(DatabaseKind.STAGING));
        assertEquals(HubConfig.DEFAULT_FINAL_NAME, hubConfig.getHttpName(DatabaseKind.FINAL));
        assertEquals(HubConfig.DEFAULT_JOB_NAME, hubConfig.getHttpName(DatabaseKind.JOB));
        assertEquals(HubConfig.DEFAULT_STAGING_NAME, hubConfig.getDbName(DatabaseKind.STAGING));
        assertEquals(HubConfig.DEFAULT_FINAL_NAME, hubConfig.getDbName(DatabaseKind.FINAL));
        assertEquals(HubConfig.DEFAULT_JOB_NAME, hubConfig.getDbName(DatabaseKind.JOB));
        assertEquals(HubConfig.DEFAULT_MODULES_DB_NAME, hubConfig.getDbName(DatabaseKind.MODULES));
        assertEquals(HubConfig.DEFAULT_STAGING_TRIGGERS_DB_NAME, hubConfig.getDbName(DatabaseKind.STAGING_TRIGGERS));
        assertEquals(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, hubConfig.getDbName(DatabaseKind.STAGING_SCHEMAS));
        assertEquals(HubConfig.DEFAULT_FINAL_TRIGGERS_DB_NAME, hubConfig.getDbName(DatabaseKind.FINAL_TRIGGERS));
        assertEquals(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, hubConfig.getDbName(DatabaseKind.FINAL_SCHEMAS));
    }

    @Test
    public void copyStagingSslConfigToAppServices() {
        AppConfig appConfig = new AppConfig();
        assertNull(appConfig.getAppServicesSslContext(), "App-Services doesn't use SSL by default");
        assertEquals(SecurityContextType.DIGEST, appConfig.getAppServicesSecurityContextType(), "App-Services connection defaults to DIGEST");

        final String originalAuthMethod = adminHubConfig.getAuthMethod(DatabaseKind.STAGING);
        final boolean originalSimpleSsl = adminHubConfig.getSimpleSsl(DatabaseKind.STAGING);
        try {
            adminHubConfig.setAppConfig(appConfig);
            adminHubConfig.setAuthMethod(DatabaseKind.STAGING, "basic");
            adminHubConfig.setSimpleSsl(DatabaseKind.STAGING, true);

            new DataHubImpl().prepareAppConfigForInstallingIntoDhs(adminHubConfig);

            assertNotNull(appConfig.getAppServicesSslContext());
            assertEquals(SecurityContextType.BASIC, appConfig.getAppServicesSecurityContextType());
        } finally {
            adminHubConfig.setAuthMethod(DatabaseKind.STAGING, originalAuthMethod);
            adminHubConfig.setSimpleSsl(DatabaseKind.STAGING, originalSimpleSsl);
        }
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
