package com.marklogic.hub.dataservices.ingestion;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.dataservices.InputEndpoint;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * This test just does some basic smoke testing of the DS endpoint; comprehensive coverage is found in the
 * marklogic-unit-test test modules. As there's a slight difference in how the endpoint handles one document vs
 * multiple documents being passed to it, this test verifies both cases.
 */
public class BulkIngestTest extends AbstractHubCoreTest {

    private InputEndpoint.BulkInputCaller bulkInputCaller;

    @BeforeEach
    void beforeEach() {
        InputEndpoint endpoint = InputEndpoint.on(
            getHubClient().getStagingClient(),
            getHubClient().getModulesClient().newTextDocumentManager().read("/data-hub/5/data-services/ingestion/bulkIngester.api", new StringHandle())
        );

        ObjectNode workUnit = objectMapper.createObjectNode();
        workUnit.put("uriprefix", "/bulkJavaTest/");

        bulkInputCaller = endpoint.bulkCaller();
        bulkInputCaller.setEndpointState("{}".getBytes());
        bulkInputCaller.setWorkUnit(new JacksonHandle(workUnit));
    }

    @Test
    void writeOneDoc() {
        Stream<InputStream> input = Stream.of(
            asInputStream("{\"docNum\":1, \"docName\":\"doc1\"}")
        );
        input.forEach(bulkInputCaller::accept);
        bulkInputCaller.awaitCompletion();

        verifyDocCount(1);
    }

    @Test
    void writeTwoDocs() {
        Stream<InputStream> input = Stream.of(
            asInputStream("{\"docNum\":1, \"docName\":\"doc1\"}"),
            asInputStream("{\"docNum\":2, \"docName\":\"doc2\"}")
        );
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

    private InputStream asInputStream(String value) {
        return new ByteArrayInputStream(value.getBytes());
    }
}
