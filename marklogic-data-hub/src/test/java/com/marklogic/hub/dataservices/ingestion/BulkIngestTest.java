package com.marklogic.hub.dataservices.ingestion;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.dataservices.InputEndpoint;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.Assert.*;

public class BulkIngestTest extends AbstractHubCoreTest {

    DatabaseClient db;

    @BeforeEach
    public void setupTest() {
        db = getHubClient().getStagingClient();
    }

    @Test
    public void testBulkIngest() {

        String prefix = "/bulkIngesterTest";
        String endpointState =  "{}";
        String workUnit      = "{\"userDefinedValue\":" + 1 + ", \"uriprefix\":\""+prefix+"\"}";

        runAsDataHubOperator();
        InputEndpoint loadEndpt = InputEndpoint.on(getHubClient().getStagingClient(),
            getHubClient().getModulesClient().newTextDocumentManager().read("/data-hub/5/data-services/ingestion/bulkIngester.api", new StringHandle()));

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

        String uriQuery = "cts.uriMatch('/bulkIngesterTest**')";
        EvalResultIterator uriQueryResult = db.newServerEval().javascript(uriQuery).eval();

        class Output {
            List<String> uris = new ArrayList();
        }
        Output output = new Output();
        uriQueryResult.iterator().forEachRemaining(item -> {
            output.uris.add(item.getString());
        });
        for(String i:output.uris)
            checkResults(i);
    }

    public static InputStream asInputStream(String value) {
        return new ByteArrayInputStream(value.getBytes());
    }

    void checkResults(String uri) {
        JSONDocumentManager jd = db.newJSONDocumentManager();
        JsonNode doc = jd.read(uri, new JacksonHandle()).get();
        assertNotNull("Could not find file ",uri);
        assertNotNull("document "+uri+" is null ",doc);
        verifyDocumentContents(doc);
    }

    void verifyDocumentContents(JsonNode doc) {
        String user = "test-data-hub-operator";
        if (!isVersionCompatibleWith520Roles()) {
            user = "flow-operator";
        }
        assertNotNull("Could not find createdOn DateTime", doc.get("envelope").get("headers").get("createdOn"));
        assertEquals(user, doc.get("envelope").get("headers").get("createdBy").asText());
        assertNotNull("Could not find Triples", doc.get("envelope").get("triples"));
        assertNotNull("Could not find instance", doc.get("envelope").get("instance"));
    }
}
