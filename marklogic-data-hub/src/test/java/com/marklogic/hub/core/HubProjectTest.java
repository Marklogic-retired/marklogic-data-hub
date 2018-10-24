package com.marklogic.hub.core;

import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class HubProjectTest extends HubTestBase {

    private static File projectPath = new File(PROJECT_PATH);

    @Before
    public void setupDir() {
        deleteProjectDir();
    }

    @Test
    public void testInit() throws IOException {
        HubConfig config = getHubFlowRunnerConfig();
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

        config.setHubRoleName("myrole");
        config.setHubUserName("myuser");

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

        assertEquals(config.getStagingAppConfig().getHost(), props.getProperty("mlHost"));

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

        assertEquals(config.getHubRoleName(), props.getProperty("mlHubUserRole"));
        assertEquals(config.getHubUserName(), props.getProperty("mlHubUserName"));

        File gradleLocalProperties = new File(projectPath, "gradle-local.properties");
        assertTrue(gradleLocalProperties.exists());
    }
}
