package com.marklogic.hub.impl;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class HubProjectImplTest extends HubTestBase {
    @Autowired
    private FlowManagerImpl flowManager;

    @BeforeEach
    public void setupDir() {
        createProjectDir();
        adminHubConfig.createProject(PROJECT_PATH);
    }

    @AfterEach
    public void cleanup() {
        deleteProjectDir();
    }

    @Test
    public void testUpgradeMappingStep() throws IOException {
        Assumptions.assumingThat(versions.isVersionCompatibleWithES(), () -> {
            FileUtils.copyFileToDirectory(getResourceFile("mapping-test/flows/CustomerXML.flow.json"), adminHubConfig.getFlowsDir().toFile());
            FileUtils.copyDirectory(getResourceFile("flow-runner-test/flows"), adminHubConfig.getFlowsDir().toFile());
            project.upgradeFlows();
            Assertions.assertEquals("entity-services-mapping", flowManager.getFlow("testFlow").getStep("6").getStepDefinitionName());
            Assertions.assertEquals("entity-services-mapping", flowManager.getFlow("CustomerXML").getStep("2").getStepDefinitionName());
        });
    }
}
