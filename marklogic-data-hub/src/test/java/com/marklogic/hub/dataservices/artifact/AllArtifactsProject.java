package com.marklogic.hub.dataservices.artifact;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.test.TestObject;
import org.springframework.util.FileCopyUtils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Intended to assist with tests that use the "all-artifacts" project.
 */
public class AllArtifactsProject extends TestObject {

    private HubClient hubClient;
    private Map<String, JsonNode> zipEntries;
    private byte[] zipBytes;

    public AllArtifactsProject(HubClient hubClient) {
        this.hubClient = hubClient;
    }

    /**
     * Downloads the project, capturing it as a byte array so we can do useful stuff with it.
     */
    public void downloadProject() {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        InputStream stream = ArtifactService.on(hubClient.getStagingClient()).downloadConfigurationFiles();
        try {
            FileCopyUtils.copy(stream, baos);
            zipBytes = baos.toByteArray();
            readZipEntries(new ZipInputStream(new ByteArrayInputStream(zipBytes)));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void verifyZipEntries() {
        // Verify artifact files
        verifyEntryExists("/flows/testFlow.flow.json", "testFlow");

        verifyEntryExists("/steps/mapping/TestOrderMapping1.step.json", "TestOrderMapping1");
        verifyEntryExists("/steps/mapping/OrderMappingJson.step.json", "OrderMappingJson");
        verifyEntryExists("/steps/ingestion/validArtifact.step.json", "validArtifact");

        verifyEntryExists("/step-definitions/custom/testStep/testStep.step.json", "testStep");
        verifyEntryExists("/matching/TestOrderMatching1.settings.json", "artifactName", "TestOrderMatching1");
        verifyEntryExists("/matching/TestOrderMatching1.matching.json", "TestOrderMatching1");

        assertEquals("Order", zipEntries.get("/entities/Order.entity.json").get("info").get("title").asText());

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
            hubClient.getDbName(DatabaseKind.STAGING));
        assertEquals(expectedPathIndex, dbProps.get("range-path-index").get(0).get("path-expression").asText());
        dbProps = verifyEntryExists("/src/main/entity-config/databases/final-database.json", "database-name",
            hubClient.getDbName(DatabaseKind.FINAL));
        assertEquals(expectedPathIndex, dbProps.get("range-path-index").get(0).get("path-expression").asText());

        assertEquals(17, zipEntries.size(), "Expecting the following entries: " +
            "1 flow; " +
            "1 entity model; " +
            "2 mapping steps; " +
            "2 matching docs (including 1 settings); " +
            "1 ingestion step; " +
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

    public Map<String, JsonNode> getZipEntries() {
        return zipEntries;
    }

    public byte[] getZipBytes() {
        return zipBytes;
    }
}
