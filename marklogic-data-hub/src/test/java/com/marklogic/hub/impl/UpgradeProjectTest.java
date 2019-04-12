package com.marklogic.hub.impl;

import com.marklogic.hub.HubConfig;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Tests various upgrade scenarios. General approach is to copy a stubbed out project from
 * src/test/resources/upgrade-projects into the build directory (a non-version-controlled area) where it
 * can then be upgraded and verified.
 */
public class UpgradeProjectTest {

    @Test
    public void upgrade43xToCurrentVersion() throws Exception {
        final String projectPath = "build/tmp/upgrade-projects/dhf43x";
        final File projectDir = Paths.get(projectPath).toFile();
        FileUtils.deleteDirectory(projectDir);
        FileUtils.copyDirectory(Paths.get("src/test/resources/upgrade-projects/dhf43x").toFile(), projectDir);

        HubProjectImpl hubProject = new HubProjectImpl();
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
}
