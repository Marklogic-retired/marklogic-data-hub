package com.marklogic.hub.rewriter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class StagingRewriterTest extends HubTestBase {

    /**
     * This is simply to verify that the custom rewriter for ML doesn't cause basic functions to fail. This was the
     * case prior to 5.2.0, as 10-rewriter.xml referred to some non-existent modules.
     */
    @Test
    void test() {
        DatabaseClient client = adminHubConfig.newStagingClient();
        JSONDocumentManager mgr = client.newJSONDocumentManager();

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
