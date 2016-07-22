package com.marklogic.hub;

import org.apache.commons.io.FileUtils;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class HubProjectTest extends HubTestBase {

    private static File projectPath = new File("ye-olde-project");

    @BeforeClass
    public static void setup() {
    }

    @AfterClass
    public static void teardown() throws IOException {
        FileUtils.deleteDirectory(projectPath);
    }

    @Test
    public void testInit() throws IOException {
        HubConfig config = getHubConfig(projectPath.toString());
        config.name = "my-crazy-test";
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

        HubProject hp = new HubProject(config);
        hp.init();

        assertTrue(new File(projectPath, "config/servers/staging-server.json").exists());
        assertTrue(new File(projectPath, "config/servers/final-server.json").exists());
        assertTrue(new File(projectPath, "config/servers/trace-server.json").exists());

        assertTrue(new File(projectPath, "config/databases/staging-database.json").exists());
        assertTrue(new File(projectPath, "config/databases/final-database.json").exists());
        assertTrue(new File(projectPath, "config/databases/trace-database.json").exists());
        assertTrue(new File(projectPath, "config/databases/modules-database.json").exists());
        assertTrue(new File(projectPath, "config/databases/schemas-database.json").exists());
        assertTrue(new File(projectPath, "config/databases/triggers-database.json").exists());

        File buildGradle = new File(projectPath, "build.gradle");
        assertTrue(buildGradle.exists());

        File gradleProperties = new File(projectPath, "gradle.properties");
        assertTrue(gradleProperties.exists());
        Properties props = new Properties();
        FileInputStream propsStream = new FileInputStream(gradleProperties);
        props.load(propsStream);
        propsStream.close();

        assertEquals(config.host, props.getProperty("mlHost"));
        assertEquals(config.name, props.getProperty("mlAppName"));

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

        assertEquals(config.modulesDbName, props.getProperty("mlModulesDbName"));
        assertEquals(config.triggersDbName, props.getProperty("mlTriggersDbName"));
        assertEquals(config.schemasDbName, props.getProperty("mlSchemasDbName"));

        File gradleLocalProperties = new File(projectPath, "gradle-local.properties");
        assertTrue(gradleLocalProperties.exists());
    }
}
