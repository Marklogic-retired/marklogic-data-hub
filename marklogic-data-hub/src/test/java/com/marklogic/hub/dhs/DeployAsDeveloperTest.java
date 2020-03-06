package com.marklogic.hub.dhs;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.ResourceFilenameFilter;
import com.marklogic.appdeployer.command.alert.DeployAlertActionsCommand;
import com.marklogic.appdeployer.command.alert.DeployAlertConfigsCommand;
import com.marklogic.appdeployer.command.alert.DeployAlertRulesCommand;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.appdeployer.command.schemas.LoadSchemasCommand;
import com.marklogic.appdeployer.command.security.DeployProtectedPathsCommand;
import com.marklogic.appdeployer.command.tasks.DeployScheduledTasksCommand;
import com.marklogic.appdeployer.command.temporal.DeployTemporalAxesCommand;
import com.marklogic.appdeployer.command.temporal.DeployTemporalCollectionsCommand;
import com.marklogic.appdeployer.command.triggers.DeployTriggersCommand;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.deploy.commands.LoadUserArtifactsCommand;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;
import com.marklogic.hub.dhs.installer.deploy.DeployHubQueryRolesetsCommand;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.mock.env.MockEnvironment;

import java.io.File;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class DeployAsDeveloperTest {

    private HubConfigImpl hubConfig;

    @BeforeEach
    void setup() {
        HubProjectImpl project = new HubProjectImpl();
        project.createProject(HubTestBase.PROJECT_PATH);
        hubConfig = new HubConfigImpl(project, new MockEnvironment());
        hubConfig.applyDefaultProperties();
    }

    @Test
    public void prepareAppConfig() {
        AppConfig appConfig = new AppConfig();
        assertTrue(appConfig.isCreateForests(), "AppConfig should default to creating forests");
        assertNull(appConfig.getResourceFilenamesIncludePattern());

        appConfig.getConfigDirs().add(new ConfigDir(new File("hub-internal-config")));
        appConfig.getConfigDirs().add(new ConfigDir(new File("my-dhs-config")));
        assertEquals(3, appConfig.getConfigDirs().size(), "Should have 3, including ml-config which is added by default");

        hubConfig.setAppConfig(appConfig);

        assertFalse(hubConfig.getIsProvisionedEnvironment());

        new DhsDeployer().prepareAppConfigForDeployingToDhs(hubConfig);

        assertTrue(hubConfig.getIsProvisionedEnvironment(), "When deploying to DHS, this property is assumed to be true, " +
            "as it's defined in the DHS portal's gradle properties file. But if someone wants to test this on-premise, it " +
            "likely won't be intuitive to set this to true. But it needs to be set to true so that DHF knows to e.g. " +
            "remove the schema/trigger database properties from database payloads, as a data-hub-developer user is not " +
            "permitted to set those.");

        assertEquals(hubConfig.getPort(DatabaseKind.STAGING), appConfig.getAppServicesPort(),
            "DHS does not allow access to the default App-Services port - 8000 - so it's set to the staging port instead so " +
                "that user modules can be loaded into the DHF modules database");

        assertFalse(appConfig.isCreateForests(), "DHS handles forest creation");

        assertEquals(2, appConfig.getConfigDirs().size(), "The hub-internal-config dir should have been removed");
        assertEquals("ml-config", appConfig.getConfigDirs().get(0).getBaseDir().getName());
        assertEquals("my-dhs-config", appConfig.getConfigDirs().get(1).getBaseDir().getName(), "A user is still " +
            "permitted to deploy their own resources from multiple configuration directories");
    }

    @Test
    public void knownPropertyValuesShouldBeFixed() {
        HubProjectImpl project = new HubProjectImpl();
        project.createProject(HubTestBase.PROJECT_PATH);
        HubConfigImpl hubConfig = new HubConfigImpl(project, new StandardEnvironment());

        // Set these to custom values that a user may use on-premise
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
        AppConfig appConfig = new AppConfig();
        // Force the AppConfig to be updated based on the values in HubConfig
        hubConfig.setAppConfig(appConfig, false);

        assertEquals("my-staging-db", appConfig.getCustomTokens().get("%%mlStagingDbName%%"), "Smoke test to verify that " +
            "one of the custom tokens is based on the custom property values set above");
        assertEquals("my-final-db", appConfig.getContentDatabaseName(), "Smoke test to verify that default names on AppConfig " +
            "were updated based on custom property values set above");

        new DhsDeployer().setKnownValuesForDhsDeployment(hubConfig);

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

        // Verify that the tokens are set back to the expected default values
        Map<String, String> tokens = hubConfig.getAppConfig().getCustomTokens();
        assertEquals(HubConfig.DEFAULT_STAGING_NAME, tokens.get("%%mlStagingAppserverName%%"));
        assertEquals(HubConfig.DEFAULT_FINAL_NAME, tokens.get("%%mlFinalAppserverName%%"));
        assertEquals(HubConfig.DEFAULT_JOB_NAME, tokens.get("%%mlJobAppserverName%%"));
        assertEquals(HubConfig.DEFAULT_STAGING_NAME, tokens.get("%%mlStagingDbName%%"));
        assertEquals(HubConfig.DEFAULT_FINAL_NAME, tokens.get("%%mlFinalDbName%%"));
        assertEquals(HubConfig.DEFAULT_JOB_NAME, tokens.get("%%mlJobDbName%%"));
        assertEquals(HubConfig.DEFAULT_MODULES_DB_NAME, tokens.get("%%mlModulesDbName%%"));
        assertEquals(HubConfig.DEFAULT_STAGING_TRIGGERS_DB_NAME, tokens.get("%%mlStagingTriggersDbName%%"));
        assertEquals(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, tokens.get("%%mlStagingSchemasDbName%%"));
        assertEquals(HubConfig.DEFAULT_FINAL_TRIGGERS_DB_NAME, tokens.get("%%mlFinalTriggersDbName%%"));
        assertEquals(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, tokens.get("%%mlFinalSchemasDbName%%"));

        // Verify that ml-gradle's "default" database properties are set to the expected default values as well
        assertEquals(HubConfig.DEFAULT_FINAL_NAME, appConfig.getContentDatabaseName());
        assertEquals(HubConfig.DEFAULT_FINAL_TRIGGERS_DB_NAME, appConfig.getTriggersDatabaseName());
        assertEquals(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, appConfig.getSchemasDatabaseName());
        assertEquals(HubConfig.DEFAULT_MODULES_DB_NAME, appConfig.getModulesDatabaseName());
    }

    @Test
    public void copyStagingSslConfigToAppServices() {
        AppConfig appConfig = new AppConfig();
        assertNull(appConfig.getAppServicesSslContext(), "App-Services doesn't use SSL by default");
        assertEquals(SecurityContextType.DIGEST, appConfig.getAppServicesSecurityContextType(), "App-Services connection defaults to DIGEST");

        final String originalAuthMethod = hubConfig.getAuthMethod(DatabaseKind.STAGING);
        final boolean originalSimpleSsl = hubConfig.getSimpleSsl(DatabaseKind.STAGING);
        try {
            hubConfig.setAppConfig(appConfig);
            hubConfig.setAuthMethod(DatabaseKind.STAGING, "basic");
            hubConfig.setSimpleSsl(DatabaseKind.STAGING, true);

            new DhsDeployer().prepareAppConfigForDeployingToDhs(hubConfig);

            assertNotNull(appConfig.getAppServicesSslContext());
            assertEquals(SecurityContextType.BASIC, appConfig.getAppServicesSecurityContextType());
        } finally {
            hubConfig.setAuthMethod(DatabaseKind.STAGING, originalAuthMethod);
            hubConfig.setSimpleSsl(DatabaseKind.STAGING, originalSimpleSsl);
        }
    }

    @Test
    public void buildCommandList() {
        List<Command> commands = new DhsDeployer().buildCommandsForDeveloper(hubConfig);
        Collections.sort(commands, Comparator.comparing(Command::getExecuteSortOrder));
        int index = 0;
        assertTrue(commands.get(index++) instanceof DeployHubQueryRolesetsCommand);
        assertTrue(commands.get(index++) instanceof DeployOtherDatabasesCommand);
        assertTrue(commands.get(index++) instanceof LoadSchemasCommand);
        assertTrue(commands.get(index++) instanceof LoadUserModulesCommand);
        assertTrue(commands.get(index++) instanceof DeployTriggersCommand);
        assertTrue(commands.get(index++) instanceof LoadUserArtifactsCommand);
        assertTrue(commands.get(index++) instanceof DeployTemporalAxesCommand);
        assertTrue(commands.get(index++) instanceof DeployTemporalCollectionsCommand);
        assertTrue(commands.get(index++) instanceof DeployScheduledTasksCommand);
        assertTrue(commands.get(index++) instanceof DeployAlertConfigsCommand);
        assertTrue(commands.get(index++) instanceof DeployAlertActionsCommand);
        assertTrue(commands.get(index++) instanceof DeployAlertRulesCommand);
        assertTrue(commands.get(index++) instanceof DeployProtectedPathsCommand);
        assertEquals(13, commands.size(),
            "As of ML 10.0-3, the granular privilege for indexes doesn't seem to work with XML payloads. " +
                "Bug https://bugtrack.marklogic.com/54231 has been created to track that. Thus, " +
                "DeployDatabaseFieldCommand cannot be included and ml-config/database-fields/final-database.xml " +
                "cannot be processed.");

        DeployOtherDatabasesCommand dodc = (DeployOtherDatabasesCommand) commands.get(1);
        ResourceFilenameFilter filter = (ResourceFilenameFilter) dodc.getResourceFilenameFilter();
        assertEquals("(staging|final|job)-database.json", filter.getIncludePattern().pattern(),
            "DHS users aren't allowed to create their own databases, so the command for deploying databases is restricted " +
                "to only updating the 3 known databases");

        DeployProtectedPathsCommand pathsCommand = (DeployProtectedPathsCommand) commands.get(commands.size() - 1);
        assertEquals(Integer.MAX_VALUE, pathsCommand.getExecuteSortOrder(),
            "The PPs command is executed last to avoid the timing issue that occurs when a user without the 'security' " +
                "role deploys PPs and then QRs immediately afterwards");
    }
}
