package com.marklogic.hub.hubcentral;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.test.TestObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Intended to assist with tests that use the "all-artifacts" project.
 */
public class AllArtifactsProject extends TestObject {

    private HubClient hubClient;
    private Map<String, JsonNode> zipEntries;
    private File zipFile;

    public AllArtifactsProject(HubClient hubClient) {
        this.hubClient = hubClient;
    }

    /**
     * Writes the zip to a file and reads all the entries into memory.
     */
    public void writeProjectArtifactsToZipFile() {
        try {
            zipFile = new File("build/allArtifactsProject.zip");
            FileOutputStream fos = new FileOutputStream(zipFile);
            new HubCentralManager().writeProjectArtifactsAsZip(hubClient, fos);
            fos.close();
            readZipEntries();
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

        assertEquals("Order", zipEntries.get("/entities/Order.entity.json").get("info").get("title").asText());

        // Verify PII stuff
        verifyEntryExists("/src/main/ml-config/security/protected-paths/1-pii-protected-paths.json",
            "path-expression", "/*:envelope//*:instance//*:Order/*:orderID");
        verifyEntryExists("/src/main/ml-config/security/protected-paths/2-pii-protected-paths.json",
            "path-expression", "/*:envelope//*:instance//*:Order/*:orderName");
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

        assertEquals(15, zipEntries.size(), "Expecting the following entries: " +
            "1 flow; " +
            "2 entity models; " +
            "2 mapping steps; " +
            "1 ingestion step; " +
            "2 protected path files (for PII); " +
            "1 query roleset file (for PII); " +
            "4 search options files; " +
            "2 database properties files; " +
            "Note that step definitions are not included because as of 5.3.0, a user cannot create/modify/delete them " +
            "via Hub Central");
    }

    private JsonNode verifyEntryExists(String path, String name) {
        return verifyEntryExists(path, "name", name);
    }

    private JsonNode verifyEntryExists(String path, String namePropertyName, String name) {
        JsonNode node = zipEntries.get(path);
        assertNotNull(node, "Did not find entry for path: " + path);
        assertTrue(node.has(namePropertyName),
            format("Could not find name property '%s' in zip entry '%s'; JSON: " + node, namePropertyName, name));
        assertEquals(name, node.get(namePropertyName).asText());
        return node;
    }

    private void readZipEntries() throws IOException {
        zipEntries = new HashMap<>();

        ZipFile zip = new ZipFile(zipFile);
        Enumeration<?> entries = zip.entries();
        while (entries.hasMoreElements()) {
            ZipEntry entry = (ZipEntry) entries.nextElement();
            int entrySize = (int) entry.getSize();
            byte[] buffer = new byte[entrySize];
            zip.getInputStream(entry).read(buffer, 0, entrySize);
            if (entry.getName().endsWith(".xml")) {
                // To allow for easily verifying the count, just toss an empty JSON object into zipEntries for XML documents
                zipEntries.put(entry.getName(), objectMapper.createObjectNode());
                String xml = new String(buffer);
                assertTrue(xml.startsWith("<search:options"), "Entries ending in XML are expected to be " +
                    "XML search options documents; actual content: " + new String(xml));
                assertContentIsPrettyPrinted(xml);
            } else {
                assertContentIsPrettyPrinted(new String(buffer));
                zipEntries.put(entry.getName(), objectMapper.readTree(buffer));
            }
        }
        zip.close();
    }

    private void assertContentIsPrettyPrinted(String xmlOrJson) {
        assertTrue(xmlOrJson.split("\n").length > 1, "Expecting the artifact content to have multiple newline symbols, which indicates " +
            "that the content is being pretty-printed as opposed to all being on one line, which would be lousy for " +
            "submitting into version control; actual content: " + xmlOrJson);
    }

    public Map<String, JsonNode> getZipEntries() {
        return zipEntries;
    }

    public File getZipFile() {
        return zipFile;
    }
}
