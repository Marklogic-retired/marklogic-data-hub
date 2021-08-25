package com.marklogic.hub.central.controllers;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentManager;
import com.marklogic.client.io.BytesHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.central.AbstractMvcTest;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.NestedServletException;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class DownloadRecordTest extends AbstractMvcTest {

    private final static String PATH = "/api/record/download";

    @BeforeEach
    void beforeEach() {
        // Need to run as developer so test document can be written
        runAsDataHubDeveloper();
    }


    @Test
    void determineFilenameForDownloadUnitTest() {
        RecordController controller = new RecordController();
        assertEquals("example.json", controller.determineFilenameForDownload("/example.json"));
        assertEquals("example.json", controller.determineFilenameForDownload("test/example.json"));
        assertEquals("example.json", controller.determineFilenameForDownload("/hello/test/example.json"));
        assertEquals("example.json", controller.determineFilenameForDownload("example.json"));
    }

    @Test
    void jsonRecord() throws Exception {
        verifyJsonRecordInDatabase("staging", getHubClient().getStagingClient());
    }

    @Test
    void jsonRecordInFinal() throws Exception {
        verifyJsonRecordInDatabase("final", getHubClient().getFinalClient());
    }

    @Test
    void jsonRecordInJobs() throws Exception {
        verifyJsonRecordInDatabase("jobs", getHubClient().getJobsClient());
    }

    @Test
    void xmlRecord() throws Exception {
        writeAndValidateDownloadRecord(getHubClient().getStagingClient().newXMLDocumentManager(), "/xmlDocument.xml", "staging",
                // The XML returned by ML will end with a newline, so gotta expect one here
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                        "<test>\n" +
                        "  <name>EntitySearch</name>\n" +
                        "</test>");
    }

    @Test
    void textRecord() throws Exception {
        writeAndValidateDownloadRecord(getHubClient().getStagingClient().newTextDocumentManager(), "/textDocument.txt", "staging",
            "test text record\ndownload");
    }

    @Test
    void binaryRecord() throws Exception {
        writeAndValidateDownloadRecord(getHubClient().getStagingClient().newBinaryDocumentManager(), "/binaryDocument", "staging",
                "test binary record download");
    }

    @Test
    void missingRecord() {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("docUri", "/nonExisting");
        params.add("database", "staging");

        NestedServletException ex = assertThrows(NestedServletException.class, () -> getJson(PATH, params));
        assertTrue(ex.getMessage().contains("Unable to download record with URI: /nonExisting"), "Unexpected error message: " + ex.getMessage());
    }


    private void writeAndValidateDownloadRecord(@NotNull DocumentManager docMgr, String docUri, String database, @NotNull String content) throws Exception {
        final byte[] contentBytes = content.getBytes();
        docMgr.write(docUri, addDefaultPermissions(new DocumentMetadataHandle()), new BytesHandle(contentBytes));

        loginAsTestUserWithRoles("hub-central-operator");
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("docUri", docUri);
        params.add("database", database);
        getJson(PATH, params)
            .andExpect(status().isOk())
            .andDo(result -> assertEquals(contentBytes.length, result.getResponse().getContentAsByteArray().length));
    }

    private void verifyJsonRecordInDatabase(String database, @NotNull DatabaseClient client) throws Exception {
        writeAndValidateDownloadRecord(client.newJSONDocumentManager(), "/jsonDocument.json", database,
                "{\n" +
                        "  \"test\": {\n" +
                        "    \"name\": \"EntitySearch\"\n" +
                        "  }\n" +
                        "}");
    }
}
