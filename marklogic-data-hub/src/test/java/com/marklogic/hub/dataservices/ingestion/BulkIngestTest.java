package com.marklogic.hub.dataservices.ingestion;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.dataservices.InputEndpoint;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.junit.Assert.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class BulkIngestTest extends AbstractHubCoreTest {

    DatabaseClient db;
    Map<String, String> options;
    String workUnit;

    public static InputStream asInputStream(String value) {
        return new ByteArrayInputStream(value.getBytes());
    }

    public void setOptions() {
        this.options = new HashMap<String, String>();
    }

    @BeforeEach
    public void setupTest() {
        db = adminHubConfig.newStagingClient(null);
    }

    @Test
    public void testBulkIngestWithoutOptions() {

        String prefix = "/bulkIngesterTest";
        workUnit = "{\"uriprefix\":\"" + prefix + "\"}";

        Output output = runIngest(workUnit);
        for (String i : output.uris) {
            checkResults(i);
        }
    }

    @Test
    public void testBulkIngestWithAllOptions() {

        workUnit = "";
        setAllOptions();
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            workUnit = objectMapper.writeValueAsString(options);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        Output output = runIngest(workUnit);
        for (String i : output.uris) {
            checkResults(i);
        }
    }

    @Test
    public void testBulkIngestWithEmptyPermissions() {

        workUnit = "";
        setOptions();
        options.put("uriprefix", "bulkIngestOptions");
        options.put("permissions", "");
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            workUnit = objectMapper.writeValueAsString(options);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        Exception exception = assertThrows(RuntimeException.class, () -> {
            runIngest(workUnit);
        });


    }

    Output runIngest(String workUnit) {
        String endpointState = "{}";
        runAsDataHubOperator();
        InputEndpoint loadEndpt = InputEndpoint.on(adminHubConfig.newStagingClient(null),
            adminHubConfig.newModulesDbClient().newTextDocumentManager().read("/data-hub/5/data-services/ingestion/bulkIngester.api", new StringHandle()));

        InputEndpoint.BulkInputCaller loader = loadEndpt.bulkCaller();
        loader.setEndpointState(new ByteArrayInputStream(endpointState.getBytes()));
        loader.setWorkUnit(new ByteArrayInputStream(workUnit.getBytes()));

        Stream<InputStream> input = Stream.of(
            asInputStream("{\"docNum\":1, \"docName\":\"doc1\"}"),
            asInputStream("{\"docNum\":2, \"docName\":\"doc2\"}"),
            asInputStream("{\"docNum\":3, \"docName\":\"doc3\"}")
        );
        input.forEach(loader::accept);
        loader.awaitCompletion();

        String uriQuery = "cts.uriMatch('/bulkIngesterTest**')";
        EvalResultIterator uriQueryResult = db.newServerEval().javascript(uriQuery).eval();

        Output output = new Output();
        uriQueryResult.iterator().forEachRemaining(item -> {
            output.uris.add(item.getString());
        });
        return output;
    }

    void setAllOptions() {
        setOptions();
        options.put("uriprefix", "bulkIngestOptions");
        options.put("collections", "docs");
        options.put("sourcename", "glue");
        options.put("sourcetype", "xml");
        options.put("permissions", "data-hub-common,read,data-hub-operator,update");
    }

    void checkResults(String uri) {
        JSONDocumentManager jd = db.newJSONDocumentManager();
        JsonNode doc = jd.read(uri, new JacksonHandle()).get();
        assertNotNull("Could not find file ", uri);
        assertNotNull("document " + uri + " is null ", doc);

        verifyDocumentContents(doc);
        verifyDocumentOptions(uri);
    }

    void verifyDocumentContents(JsonNode doc) {
        String user = "test-data-hub-operator";

        if (!isVersionCompatibleWith520Roles()) {
            user = "flow-operator";
        }

        if (options == null) {
            setOptions();
        }

        assertNotNull("Could not find createdOn DateTime", doc.get("envelope").get("headers").get("createdOn"));
        assertEquals(user, doc.get("envelope").get("headers").get("createdBy").asText());
        assertNotNull("Could not find Triples", doc.get("envelope").get("triples"));
        assertNotNull("Could not find instance", doc.get("envelope").get("instance"));

        if (options.get("sourcename") != null) {
            assertEquals(options.get("sourcename"), doc.get("envelope").get("headers").get("sources").get(0).get("name").asText());
        } else {
            assertNull(doc.get("envelope").get("headers").get("sources"));
        }

        if (options.get("sourcetype") != null) {
            assertEquals(options.get("sourcetype"), doc.get("envelope").get("headers").get("sources").get(0).get("datahubSourceType").asText());
        } else {
            assertNull(doc.get("envelope").get("headers").get("sources"));
        }
    }

    void verifyDocumentOptions(String uri) {
        JSONDocumentManager jd = db.newJSONDocumentManager();
        DocumentMetadataHandle docMetaData = jd.readMetadata(uri, new DocumentMetadataHandle());

        DocumentPermissionsParser documentPermissionParser = new DefaultDocumentPermissionsParser();
        DocumentMetadataHandle permissionMetadata = new DocumentMetadataHandle();

        if (options.get("permissions") == null) {
            options.put("permissions", "data-hub-common,read,data-hub-common,update");
        }

        documentPermissionParser.parsePermissions(options.get("permissions"), permissionMetadata.getPermissions());
        assertEquals(permissionMetadata.getPermissions(), docMetaData.getPermissions());

        if (options.get("collections") != null) {
            assertEquals(options.get("collections"), docMetaData.getCollections().toArray()[0].toString());
        } else {
            assertTrue("Expected zero Collection", docMetaData.getCollections().isEmpty());
        }
    }

    class Output {
        List<String> uris = new ArrayList();
    }
}
