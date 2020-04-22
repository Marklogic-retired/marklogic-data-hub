package com.marklogic.hub.dataservices.artifact;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.dataservices.ArtifactService;
import org.junit.jupiter.api.Test;
import org.springframework.util.FileCopyUtils;

import java.io.*;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static org.junit.jupiter.api.Assertions.*;

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
            "no user artifacts to download; zipEntries: " + zipEntries);

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
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        InputStream stream = ArtifactService.on(adminHubConfig.newStagingClient(null)).downloadConfigurationFiles();
        try {
            FileCopyUtils.copy(stream, baos);
            zipBytes = baos.toByteArray();
            readZipEntries(new ZipInputStream(new ByteArrayInputStream(zipBytes)));
        } catch (IOException e) {
            throw new RuntimeException(e);
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
        // Verify artifact files
        verifyEntryExists("/flows/testFlow.flow.json", "testFlow");
        verifyEntryExists("/mappings/TestOrderMapping1.mapping.json", "TestOrderMapping1");
        verifyEntryExists("/loadData/validArtifact.loadData.json", "validArtifact");
        verifyEntryExists("/loadData/validArtifact.settings.json", "artifactName", "validArtifact");
        verifyEntryExists("/step-definitions/custom/testStep/testStep.step.json", "testStep");
        verifyEntryExists("/matching/TestOrderMatching1.settings.json", "artifactName", "TestOrderMatching1");
        verifyEntryExists("/mappings/OrderMappingJson/OrderMappingJson-1.mapping.json", "OrderMappingJson");
        assertEquals("Order", zipEntries.get("/entities/Order.entity.json").get("info").get("title").asText());
        verifyEntryExists("/mappings/TestOrderMapping1.settings.json", "artifactName", "TestOrderMapping1");
        verifyEntryExists("/matching/TestOrderMatching1.matching.json", "TestOrderMatching1");

        // Verify PII stuff
        verifyEntryExists("/src/main/ml-config/security/protected-paths/pii-protected-path-1.json",
            "path-expression", "/envelope//instance//Order/orderID");
        verifyEntryExists("/src/main/ml-config/security/protected-paths/pii-protected-path-2.json",
            "path-expression", "/envelope//instance//Order/orderName");
        assertEquals("pii-reader", zipEntries.get("/src/main/ml-config/security/query-rolesets/pii-reader.json").get("role-name").iterator().next().asText());

        // Verify search options
        Stream.of("staging", "final").forEach(db -> {
            assertTrue(zipEntries.containsKey("/src/main/entity-config/" + db + "-entity-options.xml"));
            assertTrue(zipEntries.containsKey("/src/main/entity-config/exp-" + db + "-entity-options.xml"));
        });

        // Verify db props
        final String expectedPathIndex = "//*:instance/Order/orderID";
        JsonNode dbProps = verifyEntryExists("/src/main/entity-config/databases/staging-database.json", "database-name",
            adminHubConfig.getDbName(DatabaseKind.STAGING));
        assertEquals(expectedPathIndex, dbProps.get("range-path-index").get(0).get("path-expression").asText());
        dbProps = verifyEntryExists("/src/main/entity-config/databases/final-database.json", "database-name",
            adminHubConfig.getDbName(DatabaseKind.FINAL));
        assertEquals(expectedPathIndex, dbProps.get("range-path-index").get(0).get("path-expression").asText());

        assertEquals(19, zipEntries.size(), "Expecting 17 entries: " +
            "1 flow; " +
            "1 entity model; " +
            "3 mapping docs (including 1 settings); " +
            "2 matching docs (including 1 settings); " +
            "2 loadData docs (including 1 settings); " +
            "1 custom step definition; " +
            "2 protected path files (for PII); " +
            "1 query roleset file (for PII); " +
            "4 search options files; " +
            "2 database properties files");
    }

    private JsonNode verifyEntryExists(String path, String name) {
        return verifyEntryExists(path, "name", name);
    }

    private JsonNode verifyEntryExists(String path, String namePropertyName, String name) {
        JsonNode node = zipEntries.get(path);
        assertNotNull(node, "Did not find entry for path: " + path);
        assertEquals(name, node.get(namePropertyName).asText());
        return node;
    }

    private void readZipEntries(ZipInputStream zip) throws IOException {
        zipEntries = new HashMap<>();

        ZipEntry entry = zip.getNextEntry();
        while (entry != null) {
            int entrySize = (int) entry.getSize();
            byte[] buffer = new byte[entrySize];
            zip.read(buffer, 0, entrySize);
            if (entry.getName().endsWith(".xml")) {
                // To allow for easily verifying the count, just toss an empty JSON object into zipEntries for XML documents
                zipEntries.put(entry.getName(), objectMapper.createObjectNode());
                assertTrue(new String(buffer).startsWith("<search:options"), "Entries ending in XML are expected to be " +
                    "XML search options documents; actual content: " + new String(buffer));
            } else {
                zipEntries.put(entry.getName(), objectMapper.readTree(buffer));
            }
            zip.closeEntry();
            entry = zip.getNextEntry();
        }
        zip.close();
    }
}
