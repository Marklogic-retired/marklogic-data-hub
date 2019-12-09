package com.marklogic.hub.web.service;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.web.WebApplication;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {WebApplication.class, ApplicationConfig.class, DataHubServiceTest.class})
public class DataHubServiceTest extends AbstractServiceTest {
    private static Path projectDir = Paths.get(".", PROJECT_PATH);

    @Autowired
    DataHubService dataHubService;

    @Autowired
    HubConfigImpl hubConfig;

    @BeforeEach
    public void setUp() throws IOException {
        createProjectDir();
        hubConfig.initHubProject();
        hubConfig.refreshProject();

        //Put a couple of modules to custom module dir
        File modPath = hubConfig.getHubProject().getCustomModulesDir().toFile();
        FileUtils.copyFileToDirectory(getResourceFile("legacy-flow-manager/sjs-flow/headers.sjs"), modPath);
        FileUtils.copyFileToDirectory(getResourceFile("legacy-flow-manager/sjs-flow/content-input.sjs"), modPath);

    }

    @Test
    public void testForceLoadUserModules() {
        //Load modules with 'forceLoad' set to true
        dataHubService.installUserModules(hubConfig, true, null);
        Assertions.assertEquals(getResource("legacy-flow-manager/sjs-flow/headers.sjs"),getModulesFile("/custom-modules/headers.sjs"), "The module should be loaded");
        Assertions.assertEquals(getResource("legacy-flow-manager/sjs-flow/content-input.sjs"),getModulesFile("/custom-modules/content-input.sjs"), "The module should be loaded");
        String filePath = hubConfig.getAppConfig().getModuleTimestampsPath();
        File defaultTimestampFile = new File(filePath);

        //Ensure that timestamp file is present and not deleted after module loading
        Assertions.assertTrue(defaultTimestampFile.exists());

    }

}
