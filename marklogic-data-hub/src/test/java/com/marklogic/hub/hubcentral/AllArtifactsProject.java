package com.marklogic.hub.hubcentral;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.test.TestObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Intended to assist with tests that use the "all-artifacts" project.
 */
public class AllArtifactsProject extends TestObject {

    private HubClient hubClient;
    private Map<String, JsonNode> hubCentralFilesZipEntries;
    private File hubCentralFilesZipFile;

    public AllArtifactsProject(HubClient hubClient) {
        this.hubClient = hubClient;
    }

    /**
     * Writes the zip to a file and reads all the entries into memory.
     */
    public void writeHubCentralFilesToZipFile() {
        try{
            hubCentralFilesZipFile = new File("build/allHubCentralFiles.zip");
            FileOutputStream fos = new FileOutputStream(hubCentralFilesZipFile);
            new HubCentralManager().writeHubCentralFilesAsZip(hubClient, fos);
            fos.close();
            readZipArtifacts();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    // The path for the artifacts should not start "/" as it will not be picked up by Windows Winzip tool.
    // The path should also always be relative path and not absolute path
    public void verifyZipArtifacts(){
        // Verify artifact files
        verifyEntryExists("flows/testFlow.flow.json", "testFlow");

        verifyEntryExists("steps/mapping/TestOrderMapping1.step.json", "TestOrderMapping1");
        verifyEntryExists("steps/mapping/OrderMappingJson.step.json", "OrderMappingJson");
        verifyEntryExists("steps/ingestion/validArtifact.step.json", "validArtifact");

        // Verify path doesn't start with "/"
        verifyArtifactPathsDontStartWithSlash();

        assertEquals("Order", hubCentralFilesZipEntries.get("entities/Order.entity.json").get("info").get("title").asText());

        // Verify PII stuff
        verifyEntryExists("src/main/ml-config/security/protected-paths/01_pii-protected-paths.json",
            "path-expression", "/(es:envelope|envelope)/(es:instance|instance)/Order/orderID");
        verifyEntryExists("src/main/ml-config/security/protected-paths/02_pii-protected-paths.json",
            "path-expression", "/(es:envelope|envelope)/(es:instance|instance)/Order/orderName");
        assertEquals("pii-reader", hubCentralFilesZipEntries.get("src/main/ml-config/security/query-rolesets/pii-reader.json").get("role-name").iterator().next().asText());

        // Verify search options
        Stream.of("staging", "final").forEach(db -> {
            assertTrue(hubCentralFilesZipEntries.containsKey("src/main/entity-config/" + db + "-entity-options.xml"));
            assertTrue(hubCentralFilesZipEntries.containsKey("src/main/entity-config/exp-" + db + "-entity-options.xml"));
        });

        // Verify db props
        final String expectedPathIndex = "/(es:envelope|envelope)/(es:instance|instance)/Order/orderID";
        JsonNode dbProps = verifyEntryExists("src/main/entity-config/databases/staging-database.json", "database-name",
            hubClient.getDbName(DatabaseKind.STAGING));
        assertEquals(expectedPathIndex, dbProps.get("range-path-index").get(0).get("path-expression").asText());
        dbProps = verifyEntryExists("src/main/entity-config/databases/final-database.json", "database-name",
            hubClient.getDbName(DatabaseKind.FINAL));
        assertEquals(expectedPathIndex, dbProps.get("range-path-index").get(0).get("path-expression").asText());
        assertEquals(15, hubCentralFilesZipEntries.size(), "Expecting the following entries: " +
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

    private void verifyArtifactPathsDontStartWithSlash() {
        hubCentralFilesZipEntries.keySet().forEach(path -> assertFalse(path.startsWith("/"), format("The path %s starts with '/'", path)));
    }

    private JsonNode verifyEntryExists(String path, String name) {
        return verifyEntryExists(path, "name", name);
    }

    private JsonNode verifyEntryExists(String path, String namePropertyName, String name) {
        JsonNode node = hubCentralFilesZipEntries.get(path);
        assertNotNull(node, "Did not find entry for path: " + path);
        assertTrue(node.has(namePropertyName),
            format("Could not find name property '%s' in zip entry '%s'; JSON: " + node, namePropertyName, name));
        assertEquals(name, node.get(namePropertyName).asText());
        return node;
    }

    private void readZipArtifacts() throws IOException {
        ZipFile zip = new ZipFile(hubCentralFilesZipFile);
        InputStream zipFileStream = new FileInputStream(hubCentralFilesZipFile);
        ZipInputStream zipInputStream = new ZipInputStream(zipFileStream);
        List<ZipEntry> entries = new ArrayList<>();
        ZipEntry ze;
        while((ze  = zipInputStream.getNextEntry()) != null){
            entries.add(ze);
        }
        readZipArtifacts(zip, Collections.enumeration(entries));
        zip.close();
    }

    protected void readZipArtifacts(ZipFile zip, Enumeration<?> entries) throws IOException {
        hubCentralFilesZipEntries = new HashMap<>();
        while (entries.hasMoreElements()) {
            ZipEntry entry = (ZipEntry) entries.nextElement();
            readArtifactZipEntry(zip, entry);
        }
    }

    protected void readArtifactZipEntry(ZipFile zip, ZipEntry entry) throws IOException {
        int entrySize = (int) entry.getSize();
        byte[] buffer = new byte[entrySize];
        zip.getInputStream(entry).read(buffer, 0, entrySize);
        if (entry.getName().endsWith(".xml")) {
            // To allow for easily verifying the count, just toss an empty JSON object into zipEntries for XML documents
            hubCentralFilesZipEntries.put(entry.getName(), objectMapper.createObjectNode());
            String xml = new String(buffer);
            assertTrue(xml.startsWith("<search:options"), "Entries ending in XML are expected to be " +
                "XML search options documents; actual content: " + new String(xml));
            assertContentIsPrettyPrinted(xml);
        } else if (entry.getName().endsWith(".json")){
            assertContentIsPrettyPrinted(new String(buffer));
            hubCentralFilesZipEntries.put(entry.getName(), objectMapper.readTree(buffer));
        }
    }

    private void assertContentIsPrettyPrinted(String xmlOrJson) {
        assertTrue(xmlOrJson.split("\n").length > 1, "Expecting the artifact content to have multiple newline symbols, which indicates " +
            "that the content is being pretty-printed as opposed to all being on one line, which would be lousy for " +
            "submitting into version control; actual content: " + xmlOrJson);
    }

    public Map<String, JsonNode> getHubCentralFilesZipEntries() {
        return hubCentralFilesZipEntries;
    }

    public File getHubCentralFilesZipFile() {
        return hubCentralFilesZipFile;
    }
}
