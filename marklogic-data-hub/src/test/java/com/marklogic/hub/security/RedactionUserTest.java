package com.marklogic.hub.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.schemas.LoadSchemasCommand;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.READ;
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.UPDATE;
import static org.junit.jupiter.api.Assertions.*;

public class RedactionUserTest extends AbstractHubCoreTest {

    @BeforeEach
    void setUp() {
        installProjectInFolder("test-projects/redaction-test");
        new LoadSchemasCommand().execute(newCommandContext());

        ingestDocument();
    }

    @AfterEach
    void tearDown() {
        runAsAdmin();
        new DatabaseManager(getHubConfig().getManageClient()).clearDatabase(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
    }

    @Test
    void testRedactionAsDataHubOperator() {
        runFlowAsUser(this::runAsDataHubOperator);
        verifyRedactedDoc();
    }

    @Test
    void testRedactionAsHubCentralOperator() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());

        runFlowAsUser(() -> runAsTestUserWithRoles("hub-central-operator"));
        verifyRedactedDoc();
    }

    @Test
    void testRedactionAsAForbiddenUser() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());

        RunFlowResponse response = runFlowAsUser(() -> runAsTestUserWithRoles("hub-central-step-runner"));
        verifyRedactedDocNotPresent(response);
    }

    private void verifyRedactedDoc() {
        JsonNode docNode = getStagingDoc("/redacted/test.json");
        assertNotNull(docNode);
        assertFalse(docNode.path("phone").asText().contains("123-456-7890"), "Expected the document to have a redacted phone number.");
        assertTrue(docNode.path("phone").asText().contains("###-###-####"), "Expected the document to have a redacted phone number.");
    }

    private void verifyRedactedDocNotPresent(RunFlowResponse response) {
        assertFalse(response.getStepResponses().get("1").isSuccess(), "Since the user does not have the redaction-user role, the redaction step should fail.");
        assertEquals(1, response.getStepResponses().get("1").getStepOutput().size());
        assertTrue(response.getStepResponses().get("1").getStepOutput().get(0).contains("Need privilege: http://marklogic.com/xdmp/privileges/redaction-user"));
        assertThrows(ResourceNotFoundException.class, () -> getStagingDoc("/redacted/test.json"));
    }

    private RunFlowResponse runFlowAsUser(Runnable r) {
        r.run();
        FlowRunnerImpl flowRunner = new FlowRunnerImpl(getHubClient());
        RunFlowResponse response = flowRunner.runFlow(new FlowInputs("redaction-test"));
        flowRunner.awaitCompletion();
        return response;
    }

    private void ingestDocument() {
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("testRedaction");
        meta.getPermissions().add("data-hub-common", READ, UPDATE);
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode sourceNode = mapper.createObjectNode();
        sourceNode.put("phone", "Call 123-456-7890");
        getHubClient().getStagingClient().newJSONDocumentManager().write("/test.json", meta, new JacksonHandle(sourceNode));
    }
}
