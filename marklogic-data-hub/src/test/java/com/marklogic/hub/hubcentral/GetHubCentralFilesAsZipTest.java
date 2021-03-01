package com.marklogic.hub.hubcentral;

import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

// Running in same thread to see if that helps avoid intermittent Jenkins failures related to zip files
@Execution(ExecutionMode.SAME_THREAD)
public class GetHubCentralFilesAsZipTest extends AbstractHubCoreTest {

    private AllArtifactsProject project;

    @Test
    void forbiddenUser() {
        runAsTestUserWithRoles("data-hub-operator");
        project = new AllArtifactsProject(getHubClient());
        verifyTestUserIsForbiddenTo(project::writeHubCentralFilesToZipFile, "A user must have the data-hub-download-project-files privilege");
    }

    /**
     * For DHFPROD-4952, this also serves as a useful for testing for ensuring that steps are loaded correctly when
     * user artifacts are loaded.
     *
     * @throws IOException
     */
    @Test
    void permittedUser() throws IOException {
        // Load all artifacts from the test project
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/all-artifacts");

        // Download, verify the zip is correct
        runAsTestUserWithRoles("hub-central-downloader");
        project = new AllArtifactsProject(getHubClient());

        project.writeHubCentralFilesToZipFile();
        project.verifyZipArtifacts();


        // Clear out the test project directory and the user files in the database
        runAsAdmin();
        resetHubProject();

        // Unzip the project we downloaded in the beginning to the test project directory
        extractZipToProjectDirectory(project.getHubCentralFilesZipFile());

        // Verify that downloading returns an empty zip, since the database was cleared of user files
        runAsTestUser();
        project.writeHubCentralFilesToZipFile();
        assertEquals(0, project.getHubCentralFilesZipEntries().size(), "The zip should be empty since the project was reset, and thus there are " +
            "no user artifacts to download; zipEntries: " + project.getHubCentralFilesZipEntries());

        // Install user artifacts from the test project directory, and verify everything's still there when we download them again
        runAsDataHubDeveloper();
        installUserArtifacts();

        runAsTestUser();
        project.writeHubCentralFilesToZipFile();
        project.verifyZipArtifacts();
    }

}
