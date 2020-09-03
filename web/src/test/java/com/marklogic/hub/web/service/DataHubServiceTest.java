package com.marklogic.hub.web.service;

import com.marklogic.hub.web.AbstractWebTest;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.File;
import java.io.IOException;

public class DataHubServiceTest extends AbstractWebTest {

    @Autowired
    DataHubService dataHubService;

    @BeforeEach
    public void setUp() throws IOException {
        //Put a couple of modules to custom module dir
        File modPath = getHubConfig().getHubProject().getCustomModulesDir().toFile();
        FileUtils.copyFileToDirectory(getResourceFile("legacy-flow-manager/sjs-flow/headers.sjs"), modPath);
        FileUtils.copyFileToDirectory(getResourceFile("legacy-flow-manager/sjs-flow/content-input.sjs"), modPath);
    }

    @Test
    public void testForceLoadUserModules() {
        //Load modules with 'forceLoad' set to true
        dataHubService.installUserModules(getHubConfig(), true, null);
        Assertions.assertEquals(getResource("legacy-flow-manager/sjs-flow/headers.sjs"), getModulesFile("/custom-modules/headers.sjs"), "The module should be loaded");
        Assertions.assertEquals(getResource("legacy-flow-manager/sjs-flow/content-input.sjs"), getModulesFile("/custom-modules/content-input.sjs"), "The module should be loaded");
        String filePath = getHubConfig().getAppConfig().getModuleTimestampsPath();
        File defaultTimestampFile = new File(filePath);

        //Ensure that timestamp file is present and not deleted after module loading
        Assertions.assertTrue(defaultTimestampFile.exists());

    }

}
