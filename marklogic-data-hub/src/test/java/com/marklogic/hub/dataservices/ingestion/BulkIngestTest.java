package com.marklogic.hub.dataservices.ingestion;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.dataservices.InputCaller;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * This test just does some basic smoke testing of the DS endpoint; comprehensive coverage is found in the
 * marklogic-unit-test test modules. As there's a slight difference in how the endpoint handles one document vs
 * multiple documents being passed to it, this test verifies both cases.
 */
public class BulkIngestTest extends AbstractHubCoreTest {

    private InputCaller.BulkInputCaller<String> bulkInputCaller;

    @BeforeEach
    void beforeEach() {
        InputCaller<String> endpoint = InputCaller.on(
            getHubClient().getStagingClient(),
            getHubClient().getModulesClient().newTextDocumentManager().read("/marklogic-data-hub-spark-connector/bulkIngester.api", new StringHandle()),
            new StringHandle().withFormat(Format.JSON)
        );

        ObjectNode endpointConstants = objectMapper.createObjectNode();
        endpointConstants.put("uriprefix", "/bulkJavaTest/");

        bulkInputCaller = endpoint.bulkCaller(endpoint.newCallContext().withEndpointConstants(new JacksonHandle(endpointConstants)));
    }

    @Test
    void writeOneDoc() {
        List<String> input = new ArrayList<>();
        input.add("{\"docNum\":1, \"docName\":\"doc1\"}");
        input.forEach(bulkInputCaller::accept);
        bulkInputCaller.awaitCompletion();

        verifyDocCount(1);
    }

    @Test
    void writeTwoDocs() {
        List<String> input = new ArrayList<>();
        input.add("{\"docNum\":1, \"docName\":\"doc1\"}");
        input.add("{\"docNum\":2, \"docName\":\"doc2\"}");

        input.forEach(bulkInputCaller::accept);
        bulkInputCaller.awaitCompletion();

        verifyDocCount(2);
    }

    private void verifyDocCount(int expectedCount) {
        EvalResultIterator iter = getHubClient().getStagingClient().newServerEval().javascript("cts.uriMatch('/bulkJavaTest/**')").eval();
        final List<String> uris = new ArrayList<>();
        while (iter.hasNext()) {
            uris.add(iter.next().getString());
        }

        assertEquals(expectedCount, uris.size());
    }
}
