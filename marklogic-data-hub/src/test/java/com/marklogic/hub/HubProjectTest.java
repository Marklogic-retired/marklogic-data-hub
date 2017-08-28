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
        config.stagingHttpName = "my-crazy-test-staging";
        config.stagingDbName = "my-crazy-test-staging";
        config.stagingForestsPerHost = 100;
        config.stagingPort = 1111;

        config.finalHttpName = "my-crazy-test-final";
        config.finalDbName = "my-crazy-test-final";
        config.finalForestsPerHost = 100;
        config.finalPort = 2222;

        config.traceHttpName = "my-crazy-test-trace";
        config.traceDbName = "my-crazy-test-trace";
        config.traceForestsPerHost = 100;
        config.tracePort = 3333;

        config.modulesForestsPerHost = 3;
        config.triggersForestsPerHost = 4;

        config.schemasForestsPerHost = 5;

        config.hubRoleName = "myrole";
        config.hubUserName = "myuser";

        HubProject hp = new HubProject(config);
        hp.init();

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

        assertEquals(config.host, props.getProperty("mlHost"));

        assertEquals("twituser", props.getProperty("mlUsername"));
        assertEquals("twitpassword", props.getProperty("mlPassword"));

        assertEquals("manage-user", props.getProperty("mlManageUsername"));
        assertEquals("manage-password", props.getProperty("mlManagePassword"));

        assertEquals("admin-user", props.getProperty("mlAdminUsername"));
        assertEquals("admin-password", props.getProperty("mlAdminPassword"));

        assertEquals("9000", props.getProperty("mlAppServicesPort"));
        assertEquals("9001", props.getProperty("mlAdminPort"));
        assertEquals("9002", props.getProperty("mlManagePort"));

        assertEquals(config.stagingHttpName, props.getProperty("mlStagingAppserverName"));
        assertEquals(config.stagingPort.toString(), props.getProperty("mlStagingPort"));
        assertEquals(config.stagingDbName, props.getProperty("mlStagingDbName"));
        assertEquals(config.stagingForestsPerHost.toString(), props.getProperty("mlStagingForestsPerHost"));

        assertEquals(config.finalHttpName, props.getProperty("mlFinalAppserverName"));
        assertEquals(config.finalPort.toString(), props.getProperty("mlFinalPort"));
        assertEquals(config.finalDbName, props.getProperty("mlFinalDbName"));
        assertEquals(config.finalForestsPerHost.toString(), props.getProperty("mlFinalForestsPerHost"));

        assertEquals(config.traceHttpName, props.getProperty("mlTraceAppserverName"));
        assertEquals(config.tracePort.toString(), props.getProperty("mlTracePort"));
        assertEquals(config.traceDbName, props.getProperty("mlTraceDbName"));
        assertEquals(config.traceForestsPerHost.toString(), props.getProperty("mlTraceForestsPerHost"));

        assertEquals(config.jobHttpName, props.getProperty("mlJobAppserverName"));
        assertEquals(config.jobPort.toString(), props.getProperty("mlJobPort"));
        assertEquals(config.jobDbName, props.getProperty("mlJobDbName"));
        assertEquals(config.jobForestsPerHost.toString(), props.getProperty("mlJobForestsPerHost"));

        assertEquals(config.modulesDbName, props.getProperty("mlModulesDbName"));
        assertEquals(config.modulesForestsPerHost.toString(), props.getProperty("mlModulesForestsPerHost"));

        assertEquals(config.triggersDbName, props.getProperty("mlTriggersDbName"));
        assertEquals(config.triggersForestsPerHost.toString(), props.getProperty("mlTriggersForestsPerHost"));

        assertEquals(config.schemasDbName, props.getProperty("mlSchemasDbName"));
        assertEquals(config.schemasForestsPerHost.toString(), props.getProperty("mlSchemasForestsPerHost"));

        assertEquals(config.hubRoleName, props.getProperty("mlHubUserRole"));
        assertEquals(config.hubUserName, props.getProperty("mlHubUserName"));

        File gradleLocalProperties = new File(projectPath, "gradle-local.properties");
        assertTrue(gradleLocalProperties.exists());
    }
}
