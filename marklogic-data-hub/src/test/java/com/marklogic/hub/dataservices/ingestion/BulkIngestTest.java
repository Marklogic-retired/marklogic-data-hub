package com.marklogic.hub.dataservices.ingestion;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.dataservices.InputEndpoint;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.stream.Stream;

import static org.junit.Assert.assertNotNull;

public class BulkIngestTest extends AbstractHubCoreTest {

    DatabaseClient db;

    @BeforeEach
    public void setupTest() {
        db = adminHubConfig.newStagingClient(null);
    }

    @Test
    public void testBulkIngest() {

        String prefix = "/bulkIngestTest";
        String endpointState = "{\"next\":" + 0 + ", \"prefix\":\""+prefix+"\"}";
        String workUnit      = "{\"taskId\":"+1+"}";

        InputEndpoint loadEndpt = InputEndpoint.on(adminHubConfig.newStagingClient(null),
            adminHubConfig.newModulesDbClient().newTextDocumentManager().read("/data-hub/5/data-services/ingestion/bulkIngester.api", new StringHandle()));

        InputEndpoint.BulkInputCaller loader = loadEndpt.bulkCaller();
        loader.setEndpointState(new ByteArrayInputStream(endpointState.getBytes()));
        loader.setWorkUnit(new ByteArrayInputStream(workUnit.getBytes()));

        Stream<InputStream> input         = Stream.of(
            asInputStream("{\"docNum\":1, \"docName\":\"doc1\"}"),
            asInputStream("{\"docNum\":2, \"docName\":\"doc2\"}"),
            asInputStream("{\"docNum\":3, \"docName\":\"doc3\"}")
        );
        input.forEach(loader::accept);
        loader.awaitCompletion();
        checkResults("/bulkIngestTest/1/1.json");
        checkResults("/bulkIngestTest/1/2.json");
        checkResults("/bulkIngestTest/1/3.json");
    }

    public static InputStream asInputStream(String value) {
        return new ByteArrayInputStream(value.getBytes());
    }

    void checkResults(String uri) {
        JSONDocumentManager jd = db.newJSONDocumentManager();
        JsonNode doc = jd.read(uri, new JacksonHandle()).get();
        assertNotNull("Could not find file ",uri);
        assertNotNull("document "+uri+" is null ",doc);
    }
}
