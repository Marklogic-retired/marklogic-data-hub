package com.marklogic.hub.impl;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class InitializeConfigDirsTest extends HubTestBase {

    private final static String DEFAULT_CONFIG_PATH = String.join(File.separator, "src", "main", "ml-config");
    private static String OS = System.getProperty("os.name").toLowerCase();
    // Uses a "fresh" AppConfig object so no other test class is impacted
    private AppConfig appConfig = new AppConfig();

    @Test
    public void defaultConfigDirs() {
        List<ConfigDir> configDirs = appConfig.getConfigDirs();
        assertEquals(1, configDirs.size(), "ml-app-deployer defaults to one ConfigDir");
        assertTrue(configDirs.get(0).getBaseDir().getAbsolutePath().endsWith(DEFAULT_CONFIG_PATH));

        adminHubConfig.initializeConfigDirs(appConfig);
        configDirs = appConfig.getConfigDirs();
        assertEquals(2, configDirs.size(),
            "When only one ConfigDir exists, and it ends with the default config path, DHF should modify it to use " +
                "the hub-internal-config and ml-config paths");
    }

    @Test
    public void customConfigDirs() {
        appConfig.getConfigDirs().clear();
        appConfig.getConfigDirs().add(new ConfigDir(new File("src/test/ml-config")));
        appConfig.getConfigDirs().add(new ConfigDir(new File("custom/ml-config")));

        adminHubConfig.initializeConfigDirs(appConfig);

        List<ConfigDir> configDirs = appConfig.getConfigDirs();
        assertEquals(2, configDirs.size());

        String firstPath = String.join(File.separator, "src", "test", "ml-config");
        String secondPath = String.join(File.separator, "custom", "ml-config");
        assertTrue(configDirs.get(0).getBaseDir().getAbsolutePath().endsWith(firstPath),
            "If the user provides custom config dirs, e.g. via mlConfigPaths, then DHF still needs to resolve each " +
                "of them relative to the DHF project path");
        assertTrue(configDirs.get(1).getBaseDir().getAbsolutePath().endsWith(secondPath));
    }

    @Test
    public void absoluteCustomConfigDirs() {
        appConfig.getConfigDirs().clear();
        appConfig.getConfigDirs().add(new ConfigDir(new File("/some/absolute/path")));

        adminHubConfig.initializeConfigDirs(appConfig);

        List<ConfigDir> configDirs = appConfig.getConfigDirs();
        assertEquals(1, configDirs.size());
        if (OS.indexOf("win") >= 0) {
            assertEquals("C:\\" + String.join(File.separator, "some", "absolute", "path")
            , configDirs.get(0).getBaseDir().getAbsolutePath());
        }
        else {
            assertEquals("/" + String.join(File.separator, "some", "absolute", "path"), configDirs.get(0).getBaseDir().getAbsolutePath(),
                    "If the user for some reason sets the config dir to an absolute path, it should remain that way");
        }
    }
}
