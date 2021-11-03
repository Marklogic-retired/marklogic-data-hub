package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.dataservices.FlowService;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import com.marklogic.mgmt.api.security.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class RunStepAsUserWithDefaultCollectionsTest extends AbstractHubCoreTest {

    private final static String STEP_COLLECTION = "simpleCustomStep-output";
    private final static String USER_COLLECTION = "test-default-collection";

    @BeforeEach
    void beforeEach() {
        installProjectInFolder("test-projects/simple-custom-step");
        new ReferenceModelProject(getHubClient()).createCustomerInstance(new Customer(1, "Jane"), "staging");
    }

    @AfterEach
    void afterEach() {
        runAsAdmin();
        User user = makeTestUserWithRoles("data-hub-developer");
        user.setCollection(new ArrayList<>());
        user.save();
    }

    @Test
    void test() {
        // Use developer role so we can later modify the flow config easily
        runAsTestUserWithRoles("data-hub-developer");

        // Run the flow once with its existing configuration
        assertEquals(0, getFinalDocCount(STEP_COLLECTION));
        runFlow();
        assertEquals(1, getFinalDocCount(STEP_COLLECTION), "Running the flow should write one document to the " + STEP_COLLECTION + "collection");

        // Delete the step collection so we can test again
        getHubClient().getFinalClient().newServerEval().xquery(format("xdmp:collection-delete('%s')", STEP_COLLECTION)).evalAs(String.class);
        assertEquals(0, getFinalDocCount(STEP_COLLECTION));

        // Test with no collections configured
        removeCollectionsFromStepConfig();
        runFlow();
        assertEquals(0, getFinalDocCount(STEP_COLLECTION), "The document should not have been written to any collections, " +
            "since the step didn't define any and the user doesn't have any default ones");

        // Test with the user having a default collection
        runAsTestUserWithDefaultCollection();
        runFlow();
        assertEquals(0, getFinalDocCount(STEP_COLLECTION), "The document should not have been written to the step collection " +
            "since that was removed from the step configuration");
        assertEquals(1, getFinalDocCount(USER_COLLECTION), "Since no collections were configured on the " +
            "step, flow, or step definition, the document should have been written to the user's default collections");
    }

    private void runFlow() {
        RunFlowResponse response = runFlow(new FlowInputs("simpleCustomStepFlow"));
        assertEquals("finished", response.getJobStatus());
    }

    private void removeCollectionsFromStepConfig() {
        FlowService service = FlowService.on(getHubClient().getStagingClient());
        JsonNode flow = service.getFlow("simpleCustomStepFlow");
        ObjectNode options = (ObjectNode) flow.get("steps").get("1").get("options");
        options.remove("collections");
        ArtifactService.on(getHubClient().getStagingClient()).setArtifact("flow", "simpleCustomStepFlow", flow, "");
    }

    private void runAsTestUserWithDefaultCollection() {
        runAsAdmin();
        User user = makeTestUserWithRoles("data-hub-developer");
        user.addCollection(USER_COLLECTION);
        user.save();
        runAsTestUser();
    }
}
