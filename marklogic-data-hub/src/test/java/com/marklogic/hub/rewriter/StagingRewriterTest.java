package com.marklogic.hub.rewriter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class StagingRewriterTest extends AbstractHubCoreTest {

    /**
     * This is simply to verify that the custom rewriter for ML doesn't cause basic functions to fail. This was the
     * case prior to 5.2.0, as 10-rewriter.xml referred to some non-existent modules.
     */
    @Test
    void test() {
        JSONDocumentManager mgr = getHubClient().getStagingClient().newJSONDocumentManager();

        final String uri = "/test.json";
        ObjectNode node = new ObjectMapper().createObjectNode();
        node.put("hello", "world");

        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        metadata.getPermissions().add("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        mgr.write(uri, metadata, new JacksonHandle(node));

        assertEquals(uri, mgr.exists(uri).getUri());
        assertNotNull(mgr.read(uri, new JacksonHandle()).get());

        mgr.delete(uri);
        assertNull(mgr.exists(uri));
    }
}
