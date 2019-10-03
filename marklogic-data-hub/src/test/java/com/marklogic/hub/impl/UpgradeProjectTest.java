package com.marklogic.hub.impl;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Tests various upgrade scenarios. General approach is to copy a stubbed out project from
 * src/test/resources/upgrade-projects into the build directory (a non-version-controlled area) where it
 * can then be upgraded and verified.
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class UpgradeProjectTest extends HubTestBase {
    @Autowired
    private FlowManagerImpl flowManager;

    @Autowired
    private HubProjectImpl hubProject;

    @Autowired
    private Versions versions;

    @AfterEach
    public void cleanup() {
        deleteProjectDir();
    }


    @Test
    public void upgrade43xToCurrentVersion() throws Exception {
        final String projectPath = "build/tmp/upgrade-projects/dhf43x";
        final File projectDir = Paths.get(projectPath).toFile();
        FileUtils.deleteDirectory(projectDir);
        FileUtils.copyDirectory(Paths.get("src/test/resources/upgrade-projects/dhf43x").toFile(), projectDir);
        hubProject.createProject(projectPath);
        hubProject.init(createMap());
        hubProject.upgradeProject();

        File mappingDir = new File(projectDir, "mappings");
        File entitiesDir = new File(projectDir, "entities");
        verifyDirContents(mappingDir, 1);
        verifyDirContents(entitiesDir, 3);
    }

    private Map<String, String> createMap() {
        Map<String,String> myMap = new HashMap<>();
        myMap.put("%%mlStagingSchemasDbName%%", HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
        return myMap;
    }

    private void verifyDirContents(File dir, int expectedCount) {
        assertEquals(expectedCount, dir.listFiles().length);
    }

    @Test
    public void testUpgradeTo510MappingStep() throws IOException {
        createProjectDir();
        adminHubConfig.createProject(PROJECT_PATH);
        Assumptions.assumingThat(versions.isVersionCompatibleWithES(), () -> {
            FileUtils.copyFileToDirectory(getResourceFile("mapping-test/flows/CustomerXML.flow.json"), adminHubConfig.getFlowsDir().toFile());
            FileUtils.copyDirectory(getResourceFile("flow-runner-test/flows"), adminHubConfig.getFlowsDir().toFile());
            project.upgradeFlows();
            Assertions.assertEquals("entity-services-mapping", flowManager.getFlow("testFlow").getStep("6").getStepDefinitionName());
            Assertions.assertEquals("entity-services-mapping", flowManager.getFlow("CustomerXML").getStep("2").getStepDefinitionName());
        });
    }
}
