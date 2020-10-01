package com.marklogic.hub.step.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;


public class RunDefaultIngestionTest extends AbstractHubCoreTest {

    @Test
    void runDefaultIngestion(){
        ServerTransform serverTransform = new ServerTransform("mlRunIngest");
        DatabaseClient stagingClient = getHubClient().getStagingClient();
        WriteBatcher writeBatcher = stagingClient.newDataMovementManager().newWriteBatcher()
            .withDefaultMetadata(new DocumentMetadataHandle().withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ))
            .withTransform(serverTransform);
        writeBatcher.add("/test.json", new StringHandle("{\"testing\": \"value\"}").withFormat(Format.JSON));
        writeBatcher.flushAndWait();
        JsonNode docNode = stagingClient.newJSONDocumentManager().read("/test.json").next().getContent(new JacksonHandle()).get();
        Assertions.assertNotNull(docNode);
        Assertions.assertEquals("value", docNode.get("envelope").get("instance").get("testing").asText());
        DatabaseClient jobsClient = getHubClient().getJobsClient();
        JsonNode jobDoc = jobsClient.newServerEval().javascript("fn.head(fn.collection('Job'))").evalAs(JsonNode.class);
        Assertions.assertNotNull(jobDoc);
        Assertions.assertEquals("default-ingestion", jobDoc.get("job").get("flow").asText());
    }
}
