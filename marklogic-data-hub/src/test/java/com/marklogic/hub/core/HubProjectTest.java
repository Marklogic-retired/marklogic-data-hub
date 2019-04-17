package com.marklogic.hub.core;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class HubProjectTest extends HubTestBase {

    private static File projectPath = new File(PROJECT_PATH);

    @BeforeEach
    public void setupDir() {
        deleteProjectDir();      
    }

    @AfterEach
    public void cleanup() {
        resetProperties();
        createProjectDir();
        adminHubConfig.createProject(PROJECT_PATH);
        adminHubConfig.withPropertiesFromEnvironment("local");
        adminHubConfig.refreshProject();
    }

    @Test
    public void testInit() throws IOException {
        HubConfig config = getHubFlowRunnerConfig();
        config.createProject(PROJECT_PATH);
        config.setHttpName(DatabaseKind.STAGING, "my-crazy-test-staging");
        config.setDbName(DatabaseKind.STAGING, "my-crazy-test-staging");
        config.setForestsPerHost(DatabaseKind.STAGING, 100);
        config.setPort(DatabaseKind.STAGING, 1111);

        config.setHttpName(DatabaseKind.FINAL, "my-crazy-test-final");
        config.setDbName(DatabaseKind.FINAL, "my-crazy-test-final");
        config.setForestsPerHost(DatabaseKind.FINAL, 100);
        config.setPort(DatabaseKind.FINAL, 2222);

        config.setHttpName(DatabaseKind.JOB, "my-crazy-test-trace");
        config.setDbName(DatabaseKind.JOB, "my-crazy-test-trace");
        config.setForestsPerHost(DatabaseKind.JOB, 100);
        config.setPort(DatabaseKind.JOB, 3333);

        config.setForestsPerHost(DatabaseKind.MODULES,3);
        config.setForestsPerHost(DatabaseKind.STAGING_TRIGGERS, 4);

        config.setForestsPerHost(DatabaseKind.STAGING_SCHEMAS, 5);

        config.setFlowDeveloperRoleName("myrole");
        config.setFlowOperatorUserName("myuser");

        config.initHubProject();

        assertTrue(new File(projectPath, "src/main/hub-internal-config/servers/staging-server.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/databases/staging-database.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/databases/staging-schemas-database.json").exists());
        assertTrue(new File(projectPath, "src/main/hub-internal-config/databases/staging-triggers-database.json").exists());

        assertTrue(new File(projectPath, "src/main/ml-config/servers/final-server.json").exists());
        assertTrue(new File(projectPath, "src/main/ml-config/databases/final-database.json").exists());
        assertTrue(new File(projectPath, "src/main/ml-config/databases/modules-database.json").exists());
        assertTrue(new File(projectPath, "src/main/ml-config/databases/final-schemas-database.json").exists());
        assertTrue(new File(projectPath, "src/main/ml-config/databases/final-triggers-database.json").exists());

        File buildGradle = new File(projectPath, "build.gradle");
        assertTrue(buildGradle.exists());

        File gradleProperties = new File(projectPath, "gradle.properties");
        assertTrue(gradleProperties.exists());
        Properties props = new Properties();
        FileInputStream propsStream = new FileInputStream(gradleProperties);
        String fileContents = IOUtils.toString(propsStream);
        fileContents = fileContents.replace("mlUsername=", "mlUsername=twituser");
        fileContents = fileContents.replace("mlPassword=", "mlPassword=twitpassword");
        fileContents = fileContents.replace("# mlManageUsername=", "mlManageUsername=manage-user");
        fileContents = fileContents.replace("# mlManagePassword=", "mlManagePassword=manage-password");
        fileContents = fileContents.replace("# mlSecurityUsername=", "mlSecurityUsername=security-user");
        fileContents = fileContents.replace("# mlSecurityPassword=", "mlSecurityPassword=security-password");
        fileContents = fileContents.replace("# mlAppServicesPort=8000", "mlAppServicesPort=9000");
        fileContents = fileContents.replace("# mlAdminPort=8001", "mlAdminPort=9001");
        fileContents = fileContents.replace("# mlManagePort=8002", "mlManagePort=9002");
        InputStream updatedStream = IOUtils.toInputStream(fileContents);

        props.load(updatedStream);
        propsStream.close();

        assertEquals(config.getAppConfig().getHost(), props.getProperty("mlHost"));

        assertEquals("twituser", props.getProperty("mlUsername"));
        assertEquals("twitpassword", props.getProperty("mlPassword"));

        assertEquals("manage-user", props.getProperty("mlManageUsername"));
        assertEquals("manage-password", props.getProperty("mlManagePassword"));

        assertEquals("security-user", props.getProperty("mlSecurityUsername"));
        assertEquals("security-password", props.getProperty("mlSecurityPassword"));

        assertEquals("9000", props.getProperty("mlAppServicesPort"));
        assertEquals("9001", props.getProperty("mlAdminPort"));
        assertEquals("9002", props.getProperty("mlManagePort"));

        assertEquals(config.getHttpName(DatabaseKind.STAGING), props.getProperty("mlStagingAppserverName"));
        assertEquals(config.getPort(DatabaseKind.STAGING).toString(), props.getProperty("mlStagingPort"));
        assertEquals(config.getDbName(DatabaseKind.STAGING), props.getProperty("mlStagingDbName"));
        assertEquals(config.getForestsPerHost(DatabaseKind.STAGING).toString(), props.getProperty("mlStagingForestsPerHost"));

        assertEquals(config.getHttpName(DatabaseKind.FINAL), props.getProperty("mlFinalAppserverName"));
        assertEquals(config.getPort(DatabaseKind.FINAL).toString(), props.getProperty("mlFinalPort"));
        assertEquals(config.getDbName(DatabaseKind.FINAL), props.getProperty("mlFinalDbName"));
        assertEquals(config.getForestsPerHost(DatabaseKind.FINAL).toString(), props.getProperty("mlFinalForestsPerHost"));

        assertEquals(config.getHttpName(DatabaseKind.JOB), props.getProperty("mlJobAppserverName"));
        assertEquals(config.getPort(DatabaseKind.JOB).toString(), props.getProperty("mlJobPort"));
        assertEquals(config.getDbName(DatabaseKind.JOB), props.getProperty("mlJobDbName"));
        assertEquals(config.getForestsPerHost(DatabaseKind.JOB).toString(), props.getProperty("mlJobForestsPerHost"));

        assertEquals(config.getDbName(DatabaseKind.MODULES), props.getProperty("mlModulesDbName"));
        assertEquals(config.getForestsPerHost(DatabaseKind.MODULES).toString(), props.getProperty("mlModulesForestsPerHost"));

        assertEquals(config.getDbName(DatabaseKind.STAGING_TRIGGERS), props.getProperty("mlStagingTriggersDbName"));
        assertEquals(config.getForestsPerHost(DatabaseKind.STAGING_TRIGGERS).toString(), props.getProperty("mlStagingTriggersForestsPerHost"));

        assertEquals(config.getDbName(DatabaseKind.STAGING_SCHEMAS), props.getProperty("mlStagingSchemasDbName"));
        assertEquals(config.getForestsPerHost(DatabaseKind.STAGING_SCHEMAS).toString(), props.getProperty("mlStagingSchemasForestsPerHost"));

        assertEquals(config.getFlowDeveloperRoleName(), props.getProperty("mlFlowDeveloperRole"));
        assertEquals(config.getFlowDeveloperUserName(), props.getProperty("mlFlowDeveloperUserName"));
        assertEquals(config.getFlowOperatorRoleName(), props.getProperty("mlFlowOperatorRole"));
        assertEquals(config.getFlowOperatorUserName(), props.getProperty("mlFlowOperatorUserName"));

        File gradleLocalProperties = new File(projectPath, "gradle-local.properties");
        assertTrue(gradleLocalProperties.exists());
    }

   @Test
    public void testUserModulesDeployTimestampFilePath() {
        String envName = "dev";

        adminHubConfig.withPropertiesFromEnvironment(envName);
        adminHubConfig.refreshProject();

        String expectedPath = Paths.get(PROJECT_PATH, ".tmp", envName + "-" + adminHubConfig.USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES).toString();

        assertEquals(expectedPath, adminHubConfig.getHubProject().getUserModulesDeployTimestampFile());
    }
    
    @Test
    public void upgrade300To403ToCurrentVersion() throws Exception {
        Assumptions.assumeFalse((isCertAuth() || isSslRun()));
        Assumptions.assumeFalse(getDataHubAdminConfig().getIsProvisionedEnvironment());
        final String projectPath = "build/tmp/upgrade-projects/dhf403from300";
        final File projectDir = Paths.get(projectPath).toFile();

        FileUtils.deleteDirectory(projectDir);
        FileUtils.copyDirectory(Paths.get("src/test/resources/upgrade-projects/dhf403from300").toFile(), projectDir);
        resetProperties();
        adminHubConfig.createProject(projectDir.getAbsolutePath());
        adminHubConfig.refreshProject();

        dataHub.upgradeHub();

        // Confirm that the directories have been backed up
        Assertions.assertTrue(adminHubConfig.getHubProject().getProjectDir()
                .resolve("src/main/hub-internal-config-4.0.3").toFile().exists());
        //This file should be present in backed up location
        Assertions.assertTrue(adminHubConfig.getHubProject().getProjectDir()
                .resolve("src/main/hub-internal-config-4.0.3/databases/final-database.json").toFile().exists());
        Assertions.assertTrue(adminHubConfig.getHubProject().getProjectDir()
                .resolve("src/main/ml-config-4.0.3").toFile().exists());
        
    }
}
