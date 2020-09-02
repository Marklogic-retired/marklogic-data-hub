package com.marklogic.hub.step.impl;

import com.marklogic.hub.impl.HubProjectImpl;
import org.apache.commons.lang3.SystemUtils;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class DetermineInputFilePathTest {

    @Test
    void absolutePath() {
        HubProjectImpl project = new HubProjectImpl();
        project.createProject("build");

        Path path = new WriteStepRunner(null, project).determineInputFilePath("/absolute/path");
        String winAbsolutePath = System.getProperty("user.dir")+"\\build\\absolute\\path";
        if(SystemUtils.OS_NAME.toLowerCase().contains("windows")) {
            assertEquals(winAbsolutePath, path.toString());
        } else {
            assertEquals("/absolute/path", path.toString());
        }
    }

    @Test
    void relativePathWithHubProject() {
        HubProjectImpl project = new HubProjectImpl();
        project.createProject("build");

        Path path = new WriteStepRunner(null, project).determineInputFilePath("relativePath");

        final String expectedDir = project.getProjectDir().resolve("relativePath").toString();
        assertEquals(expectedDir, path.toString());
    }

    @Test
    void relativePathWithNoHubProject() {
        Path path = new WriteStepRunner(null, null).determineInputFilePath("relativePath");

        final String expectedDir = Paths.get("relativePath").toAbsolutePath().toString();
        assertEquals(expectedDir, path.toString(),
            "When no HubProject is available, the inputFilePath should be resolved based on the current working directory");
    }
}
