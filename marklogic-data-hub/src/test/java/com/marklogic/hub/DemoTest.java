package com.marklogic.hub;

import com.marklogic.hub.config.ApplicationConfig;
import com.marklogic.hub.util.Installer;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.Assert;
import org.junit.Test;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {ApplicationConfig.class})
public class DemoTest extends HubTestBase
{
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();
    private static File pluginDir = projectPath.resolve("plugins").toFile();

    @Autowired
    HubConfig hubConfig;

    @Autowired
    HubConfig hubConfig2;

    @Autowired
    DataHub dataHub;

    @Autowired
    HubConfigBuilder hubConfigBuilder;

    @Autowired
    HubProject hubProject;

    @BeforeAll
    public static void setupHub()
    {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().setupProject();
    }

    @AfterAll
    public static void teardown()
    {
        new Installer().teardownProject();
    }

    @BeforeEach
    public void setup() throws IOException
    {
        deleteProjectDir();

        createProjectDir();
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    @Test
    public void test()
    {
        hubConfigBuilder.withProjectDir(PROJECT_PATH).withPropertiesFromEnvironment().build();
        hubConfig.setProjectDir(PROJECT_PATH);
        Assert.assertEquals(hubConfig, hubConfig2);
        System.out.println(hubProject.getUserConfigDir());
        System.out.println(dataHub.isInstalled());
    }
}
