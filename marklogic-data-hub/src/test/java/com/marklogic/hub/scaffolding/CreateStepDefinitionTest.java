package com.marklogic.hub.scaffolding;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.FlowService;
import com.marklogic.hub.impl.ScaffoldingImpl;
import com.marklogic.hub.step.StepDefinition;

import org.junit.jupiter.api.Test;

public class CreateStepDefinitionTest extends AbstractHubCoreTest {

    @Test
    void customIngestion() {
        scaffoldCustomIngestionStepDefinitionAndStep();
        createFlowAndAddStep();

        // Verify data can be ingested based on the scaffolded step module
        ObjectNode customer = objectMapper.createObjectNode();
        customer.put("customerId", "1");
        // The ingestion step collections/permissions cannot be used by a REST transform, so must set some here
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        metadata.withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        getHubClient().getStagingClient().newJSONDocumentManager().write("/a-customer.json", metadata, new JacksonHandle(customer),
            new ServerTransform("mlRunIngest").addParameter("flow-name", "myFlow").addParameter("step", "1"));

        JsonNode doc = getStagingDoc("/a-customer.json");
        assertEquals("1", doc.get("envelope").get("instance").get("customerId").asText(),
            "The scaffolded custom step should wrap the incoming data in an envelope");
    }

    private void scaffoldCustomIngestionStepDefinitionAndStep() {
        ScaffoldingImpl scaffolding = new ScaffoldingImpl(getHubConfig());

        StepDefinition stepDef = scaffolding.createStepDefinition("myIngester", "ingestion", "sjs");
        assertEquals("/custom-modules/ingestion/myIngester/main.sjs", stepDef.getModulePath());
        installUserModules(getHubConfig(), true);

        scaffolding.createStepFile("myIngestionStep", "ingestion", "myIngester", null);
    }

    private void createFlowAndAddStep() {
        FlowService flowService = FlowService.on(getHubClient().getStagingClient());
        flowService.createFlow("myFlow", "testing");
        flowService.addStepToFlow("myFlow", "myIngestionStep", "ingestion");
    }
}
