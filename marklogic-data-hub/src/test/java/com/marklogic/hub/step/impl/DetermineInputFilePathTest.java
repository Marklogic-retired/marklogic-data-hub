package com.marklogic.hub.step.impl;

import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class DetermineInputFilePathTest {

    @Test
    void absolutePath() {
        HubProjectImpl project = new HubProjectImpl();
        project.createProject(HubTestBase.PROJECT_PATH);

        Path path = new WriteStepRunner(new HubConfigImpl(project, null)).determineInputFilePath("/absolute/path");
        assertEquals("/absolute/path", path.toString());
    }

    @Test
    void relativePathWithHubProject() {
        HubProjectImpl project = new HubProjectImpl();
        project.createProject(HubTestBase.PROJECT_PATH);

        Path path = new WriteStepRunner(new HubConfigImpl(project, null)).determineInputFilePath("relativePath");

        final String expectedDir = project.getProjectDir().resolve("relativePath").toString();
        assertEquals(expectedDir, path.toString());
    }

    @Test
    void relativePathWithNoHubProject() {
        Path path = new WriteStepRunner(new HubConfigImpl()).determineInputFilePath("relativePath");

        final String expectedDir = Paths.get("relativePath").toAbsolutePath().toString();
        assertEquals(expectedDir, path.toString(),
            "When no HubProject is available, the inputFilePath should be resolved based on the current working directory");
    }
}
