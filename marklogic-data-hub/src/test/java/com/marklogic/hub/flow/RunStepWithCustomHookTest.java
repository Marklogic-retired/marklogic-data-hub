package com.marklogic.hub.flow;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class RunStepWithCustomHookTest extends AbstractHubCoreTest {

    private final static String URI_CREATED_BY_HOOK = "/insertedByHook/customer1.json";

    ReferenceModelProject project;
    HubClient client;

    @BeforeEach
    void beforeEach() {
        project = installReferenceModelProject();
        runAsDataHubOperator();
        client = getHubClient();
        project.createRawCustomer(1, "Jane");
    }

    @Test
    void beforeHook() {
        RunFlowResponse response = project.runFlow(new FlowInputs("customHookFlow", "1"));
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus());

        assertNotNull(client.getStagingClient().newDocumentManager().exists(URI_CREATED_BY_HOOK));
        assertNull(client.getFinalClient().newDocumentManager().exists(URI_CREATED_BY_HOOK));
    }

    /**
     * Note that because the hook operation gets the content objects as they were before the step module was executed,
     * the URI of the document inserted by the hook is still based on the URI of the input, not on the content object
     * returned by the step module. That's likely not expected behavior, but that's why custom hooks are being replaced
     * by step processors.
     */
    @Test
    void afterHook() {
        RunFlowResponse response = project.runFlow(new FlowInputs("customHookFlow", "2"));
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus());

        assertNull(client.getStagingClient().newDocumentManager().exists(URI_CREATED_BY_HOOK));
        assertNotNull(client.getFinalClient().newDocumentManager().exists(URI_CREATED_BY_HOOK));
    }
}
