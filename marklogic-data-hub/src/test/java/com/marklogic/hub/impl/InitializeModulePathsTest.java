package com.marklogic.hub.impl;

import com.marklogic.appdeployer.AppConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class InitializeModulePathsTest {

    private final static String DEFAULT_MODULES_PATH = String.join(File.separator, "src", "main", "ml-modules");

    private static String OS = System.getProperty("os.name").toLowerCase();

    private AppConfig appConfig = new AppConfig();
    private HubConfigImpl hubConfig;

    private String projectModulesPath;

    @BeforeEach
    void beforeEach() {
        HubProjectImpl project = new HubProjectImpl();
        project.createProject("build");
        hubConfig = new HubConfigImpl(project);

        projectModulesPath = String.join(File.separator, hubConfig.getHubProject().getProjectDir().toFile().getName(), DEFAULT_MODULES_PATH);
    }

    @Test
    public void defaultModulePaths() {
        List<String> modulePaths = appConfig.getModulePaths();
        assertEquals(1, modulePaths.size(), "ml-app-deployer defaults to a single modules path");
        /*Default modules path seems to be "src/main/ml-modules" and doesn't seem to change with
         * OS. Once modules path is initialized, it picks the OS specific file separator.
         */
        assertEquals("src/main/ml-modules", modulePaths.get(0));

        hubConfig.initializeModulePaths(appConfig);

        modulePaths = appConfig.getModulePaths();
        assertEquals(1, modulePaths.size(), "Should still just have a single modules path");
        assertTrue(modulePaths.get(0).endsWith(projectModulesPath),
            "But the single modules path should now be relative to the project path");
    }

    /**
     * The use case behind this is when a user wants to configure mlModulePaths in their gradle.properties file.
     * We want to ensure those paths are retained, but they need to be made relative to the project so that they work
     * when loading modules via the QS app.
     */
    @Test
    public void customModulePaths() {
        appConfig.getModulePaths().clear();
        appConfig.getModulePaths().add("src/main/ml-modules");
        appConfig.getModulePaths().add("src/test/ml-modules");
        hubConfig.initializeModulePaths(appConfig);

        List<String> modulePaths = appConfig.getModulePaths();
        assertEquals(2, modulePaths.size(), "Should have both module paths");
        assertTrue(modulePaths.get(0).endsWith(projectModulesPath),
            "The first path should be the default path, relative to the project");

        String testModulesPath = String.join(File.separator, hubConfig.getHubProject().getProjectDirString(), "src", "test", "ml-modules");
        assertTrue(modulePaths.get(1).endsWith(testModulesPath),
            "And the custom path should also be relative to the project");
    }

    @Test
    public void absoluteCustomPaths() {
        appConfig.getModulePaths().clear();
        appConfig.getModulePaths().add("/some/absolute/path");
        hubConfig.initializeModulePaths(appConfig);

        List<String> modulePaths = appConfig.getModulePaths();
        assertEquals(1, modulePaths.size(),
            "If a user overrides module paths, e.g. via mlModulePaths, the default modules path is not added by default");
        if (OS.indexOf("win") >= 0) {
            assertEquals("C:\\some\\absolute\\path", modulePaths.get(0),
                "If the user for some reason specifies an absolute path (not likely), it will be kept as-is");
        } else {
            assertEquals("/some/absolute/path", modulePaths.get(0),
                "If the user for some reason specifies an absolute path (not likely), it will be kept as-is");
        }
    }
}
