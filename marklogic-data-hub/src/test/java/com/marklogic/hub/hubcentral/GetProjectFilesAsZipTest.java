package com.marklogic.hub.hubcentral;

import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Test;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class GetProjectFilesAsZipTest extends AbstractHubCoreTest {

    private AllArtifactsProject project;

    @Test
    void forbiddenUser() {
        runAsTestUserWithRoles("data-hub-operator");
        project = new AllArtifactsProject(getHubClient());
        verifyTestUserIsForbiddenTo(project::writeProjectArtifactsToZipFile, "A user must have the data-hub-download-project-files privilege");
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

        project.writeProjectArtifactsToZipFile();
        project.verifyZipEntries();

        // Clear out the test project directory and the user files in the database
        runAsAdmin();
        resetHubProject();

        // Unzip the project we downloaded in the beginning to the test project directory
        extractZipToProjectDirectory();

        // Verify that downloading returns an empty zip, since the database was cleared of user files
        runAsTestUser();
        project.writeProjectArtifactsToZipFile();
        assertEquals(0, project.getZipEntries().size(), "The zip should be empty since the project was reset, and thus there are " +
            "no user artifacts to download; zipEntries: " + project.getZipEntries());

        // Install user artifacts from the test project directory, and verify everything's still there when we download them again
        runAsDataHubDeveloper();
        installUserArtifacts();

        runAsTestUser();
        project.writeProjectArtifactsToZipFile();
        project.verifyZipEntries();
    }

    private void extractZipToProjectDirectory() throws IOException {
        ZipFile zip = new ZipFile(project.getZipFile());
        Enumeration<?> entries = zip.entries();
        while (entries.hasMoreElements()) {
            ZipEntry entry = (ZipEntry) entries.nextElement();
            int entrySize = (int) entry.getSize();
            byte[] buffer = new byte[entrySize];
            zip.getInputStream(entry).read(buffer, 0, entrySize);

            File file = new File(getHubProject().getProjectDir().toFile(), entry.getName());
            file.getParentFile().mkdirs();
            FileCopyUtils.copy(buffer, file);
        }
    }
}
