package com.marklogic.hub;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.junit.AfterClass;
import org.junit.BeforeClass;
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

    @BeforeClass
    public static void setup() throws IOException {
        FileUtils.deleteDirectory(projectPath);
    }

    @AfterClass
    public static void teardown() throws IOException {
        FileUtils.deleteDirectory(projectPath);
    }

    @Test
    public void testInit() throws IOException {
        HubConfig config = getHubConfig();
        config.setStagingHttpName("my-crazy-test-staging");
        config.setStagingDbName("my-crazy-test-staging");
        config.setStagingForestsPerHost(100);
        config.setStagingPort(1111);

        config.setFinalHttpName("my-crazy-test-final");
        config.setFinalDbName("my-crazy-test-final");
        config.setFinalForestsPerHost(100);
        config.setFinalPort(2222);

        config.setTraceHttpName("my-crazy-test-trace");
        config.setTraceDbName("my-crazy-test-trace");
        config.setTraceForestsPerHost(100);
        config.setTracePort(3333);

        config.setModulesForestsPerHost(3);
        config.setTriggersForestsPerHost(4);

        config.setSchemasForestsPerHost(5);

        config.setHubRoleName("myrole");
        config.setHubUserName("myuser");

        config.initHubProject();

        assertTrue(new File(projectPath, "hub-internal-config/servers/staging-server.json").exists());
        assertTrue(new File(projectPath, "hub-internal-config/servers/final-server.json").exists());
        assertTrue(new File(projectPath, "hub-internal-config/servers/trace-server.json").exists());

        assertTrue(new File(projectPath, "hub-internal-config/databases/staging-database.json").exists());
        assertTrue(new File(projectPath, "hub-internal-config/databases/final-database.json").exists());
        assertTrue(new File(projectPath, "hub-internal-config/databases/trace-database.json").exists());
        assertTrue(new File(projectPath, "hub-internal-config/databases/modules-database.json").exists());
        assertTrue(new File(projectPath, "hub-internal-config/databases/schemas-database.json").exists());
        assertTrue(new File(projectPath, "hub-internal-config/databases/triggers-database.json").exists());

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
        fileContents = fileContents.replace("# mlAdminUsername=", "mlAdminUsername=admin-user");
        fileContents = fileContents.replace("# mlAdminPassword=", "mlAdminPassword=admin-password");
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

        assertEquals("admin-user", props.getProperty("mlAdminUsername"));
        assertEquals("admin-password", props.getProperty("mlAdminPassword"));

        assertEquals("9000", props.getProperty("mlAppServicesPort"));
        assertEquals("9001", props.getProperty("mlAdminPort"));
        assertEquals("9002", props.getProperty("mlManagePort"));

        assertEquals(config.getStagingHttpName(), props.getProperty("mlStagingAppserverName"));
        assertEquals(config.getStagingPort().toString(), props.getProperty("mlStagingPort"));
        assertEquals(config.getStagingDbName(), props.getProperty("mlStagingDbName"));
        assertEquals(config.getStagingForestsPerHost().toString(), props.getProperty("mlStagingForestsPerHost"));

        assertEquals(config.getFinalHttpName(), props.getProperty("mlFinalAppserverName"));
        assertEquals(config.getFinalPort().toString(), props.getProperty("mlFinalPort"));
        assertEquals(config.getFinalDbName(), props.getProperty("mlFinalDbName"));
        assertEquals(config.getFinalForestsPerHost().toString(), props.getProperty("mlFinalForestsPerHost"));

        assertEquals(config.getTraceHttpName(), props.getProperty("mlTraceAppserverName"));
        assertEquals(config.getTracePort().toString(), props.getProperty("mlTracePort"));
        assertEquals(config.getTraceDbName(), props.getProperty("mlTraceDbName"));
        assertEquals(config.getTraceForestsPerHost().toString(), props.getProperty("mlTraceForestsPerHost"));

        assertEquals(config.getJobHttpName(), props.getProperty("mlJobAppserverName"));
        assertEquals(config.getJobPort().toString(), props.getProperty("mlJobPort"));
        assertEquals(config.getJobDbName(), props.getProperty("mlJobDbName"));
        assertEquals(config.getJobForestsPerHost().toString(), props.getProperty("mlJobForestsPerHost"));

        assertEquals(config.getModulesDbName(), props.getProperty("mlModulesDbName"));
        assertEquals(config.getModulesForestsPerHost().toString(), props.getProperty("mlModulesForestsPerHost"));

        assertEquals(config.getTriggersDbName(), props.getProperty("mlTriggersDbName"));
        assertEquals(config.getTriggersForestsPerHost().toString(), props.getProperty("mlTriggersForestsPerHost"));

        assertEquals(config.getSchemasDbName(), props.getProperty("mlSchemasDbName"));
        assertEquals(config.getSchemasForestsPerHost().toString(), props.getProperty("mlSchemasForestsPerHost"));

        assertEquals(config.getHubRoleName(), props.getProperty("mlHubUserRole"));
        assertEquals(config.getHubUserName(), props.getProperty("mlHubUserName"));

        File gradleLocalProperties = new File(projectPath, "gradle-local.properties");
        assertTrue(gradleLocalProperties.exists());
    }
}
