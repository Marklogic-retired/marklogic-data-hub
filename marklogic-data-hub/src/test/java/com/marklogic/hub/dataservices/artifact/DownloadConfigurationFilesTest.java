package com.marklogic.hub.dataservices.artifact;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.ArtifactService;
import org.junit.jupiter.api.Test;
import org.springframework.util.FileCopyUtils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class DownloadConfigurationFilesTest extends AbstractHubCoreTest {

    private Map<String, JsonNode> zipEntries;
    private byte[] zipBytes;

    @Test
    void forbiddenUser() {
        setTestUserRoles("data-hub-operator");
        verifyTestUserIsForbiddenTo(this::downloadProject, "A user must have the data-hub-download-configuration-files privilege");
    }

    @Test
    void permittedUser() throws IOException {
        setTestUserRoles("hub-central-downloader");

        // Load all artifacts from the test project
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/all-artifacts");

        // Download, verify the zip is correct
        runAsTestUser();
        downloadProject();
        verifyZipEntries();

        // Clear out the test project directory and the user files in the database
        runAsAdmin();
        resetHubProject();

        // Unzip the project we downloaded in the beginning to the test project directory
        extractZipToProjectDirectory();

        // Verify that downloading returns an empty zip, since the database was cleared of user files
        runAsTestUser();
        downloadProject();
        assertEquals(0, zipEntries.size(), "The zip should be empty since the project was reset, and thus there are " +
            "no user artifacts to download");

        // Install user artifacts from the test project directory, and verify everything's still there when we download them again
        runAsDataHubDeveloper();
        installUserArtifacts();

        runAsTestUser();
        downloadProject();
        verifyZipEntries();
    }

    /**
     * Downloads the project, capturing it as a byte array so we can do useful stuff with it.
     */
    private void downloadProject() {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            FileCopyUtils.copy(ArtifactService.on(adminHubConfig.newStagingClient(null)).downloadConfigurationFiles(), baos);
            zipBytes = baos.toByteArray();
            zipEntries = readZipEntries(new ZipInputStream(new ByteArrayInputStream(zipBytes)));
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    private void extractZipToProjectDirectory() throws IOException {
        ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(zipBytes));
        ZipEntry entry = zip.getNextEntry();
        while (entry != null) {
            int entrySize = (int) entry.getSize();
            byte[] buffer = new byte[entrySize];
            zip.read(buffer, 0, entrySize);
            File file = new File(PROJECT_PATH, entry.getName());
            file.getParentFile().mkdirs();
            FileCopyUtils.copy(buffer, file);
            zip.closeEntry();
            entry = zip.getNextEntry();
        }
        zip.close();
    }

    private void verifyZipEntries() {
        verifyEntryExists("/flows/testFlow.flow.json", "testFlow");
        verifyEntryExists("/mappings/TestOrderMapping1.mappings.json", "TestOrderMapping1");
        verifyEntryExists("/loadData/validArtifact.loadData.json", "validArtifact");
        verifyEntryExists("/loadData/validArtifact.settings.json", "artifactName", "validArtifact");
        verifyEntryExists("/step-definitions/custom/testStep/testStep.step.json", "testStep");
        verifyEntryExists("/matching/TestOrderMatching1.settings.json", "artifactName", "TestOrderMatching1");
        verifyEntryExists("/mappings/OrderMappingJson/OrderMappingJson-1.mapping.json", "OrderMappingJson");
        assertEquals("Order", zipEntries.get("/entities/Order.entity.json").get("info").get("title").asText());
        verifyEntryExists("/mappings/TestOrderMapping1.settings.json", "artifactName", "TestOrderMapping1");
        verifyEntryExists("/matching/TestOrderMatching1.matching.json", "TestOrderMatching1");
        assertEquals(10, zipEntries.size(), "Expecting 10 entries: 1 flow; 1 entity model; 3 mapping docs " +
            "(including 1 settings); 2 matching docs (including 1 settings); 2 loadData docs (including 1 settings); " +
            "1 custom step definition");
    }

    private void verifyEntryExists(String path, String name) {
        verifyEntryExists(path, "name", name);
    }

    private void verifyEntryExists(String path, String namePropertyName, String name) {
        JsonNode flow = zipEntries.get(path);
        assertEquals(name, flow.get(namePropertyName).asText());
    }

    private Map<String, JsonNode> readZipEntries(ZipInputStream zip) throws IOException {
        Map<String, JsonNode> files = new HashMap<>();
        ZipEntry entry = zip.getNextEntry();
        while (entry != null) {
            int entrySize = (int) entry.getSize();
            byte[] buffer = new byte[entrySize];
            zip.read(buffer, 0, entrySize);
            files.put(entry.getName(), objectMapper.readTree(buffer));
            zip.closeEntry();
            entry = zip.getNextEntry();
        }
        zip.close();
        return files;
    }
}
