package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.test.ReferenceModelProject;
import com.marklogic.hub.job.JobStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

public class RunStepWithProcessorsTest extends AbstractHubCoreTest {

    private final static String CUSTOMER1_URI = "/echo/customer1.json";
    private final static String CUSTOMER2_URI = "/echo/customer2.json";

    ReferenceModelProject project;

    @BeforeEach
    void beforeEach() {
        project = installReferenceModelProject();
        runAsDataHubOperator();
        project.createRawCustomer(1, "Jane");
        project.createRawCustomer(2, "John");
    }

    @Test
    void test() {
        RunFlowResponse response = project.runFlow(new FlowInputs("stepProcessors", "1"));
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus());

        JSONDocumentManager mgr = adminHubConfig.newFinalClient().newJSONDocumentManager();
        Stream.of(CUSTOMER1_URI, CUSTOMER2_URI).forEach(uri -> {
            JsonNode customer = mgr.read(uri, new JacksonHandle()).get();
            assertEquals("world", customer.get("envelope").get("headers").get("hello").asText(),
                "The hello header should have been added by the addHeaders.sjs processor");
        });

        DocumentMetadataHandle.DocumentPermissions perms = mgr.readMetadata(CUSTOMER1_URI, new DocumentMetadataHandle()).getPermissions();
        assertEquals(2, perms.get("data-hub-operator").size());
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("qconsole-user").iterator().next(),
            "The addPermissions.sjs processor should have added qconsole-user/read to the first document since it " +
                "has a name of 'Jane'");

        perms = mgr.readMetadata(CUSTOMER2_URI, new DocumentMetadataHandle()).getPermissions();
        assertEquals(2, perms.get("data-hub-operator").size());
        assertNull(perms.get("qconsole-user"),
            "The second customer shouldn't have a qconsole-user permission since it doesn't have a name of 'Jane'");
    }

    @Test
    void missingProcessorModule() {
        RunFlowResponse response = project.runFlow(new FlowInputs("stepProcessors", "2"));
        assertEquals(JobStatus.FAILED.toString(), response.getJobStatus(),
            "The job should have failed because step 2 references an invalid path");

        String stepOutput = response.getStepResponses().get("2").getStepOutput().get(0);
        assertTrue(stepOutput.contains("XDMP-MODNOTFOUND"), "The step output should have a single entry with an " +
            "error message indicating that the module was not found and thus XDMP-MODNOTFOUND should be present; " +
            "actual step output: " + stepOutput);
    }

    @Test
    void missingWhen() {
        RunFlowResponse response = project.runFlow(new FlowInputs("stepProcessors", "3"));
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus());

        JSONDocumentManager mgr = adminHubConfig.newFinalClient().newJSONDocumentManager();
        Stream.of(CUSTOMER1_URI, CUSTOMER2_URI).forEach(uri -> {
            JsonNode customer = mgr.read(uri, new JacksonHandle()).get();
            assertFalse(customer.get("envelope").get("headers").has("hello"),
                "Because the processor doesn't have a 'when' property, the processor will be ignored (as opposed to throwing an error).");
        });
    }
}
