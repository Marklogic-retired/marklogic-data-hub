package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.central.controllers.FlowController;
import com.marklogic.hub.central.controllers.JobsController;
import com.marklogic.hub.central.controllers.LoadDataController;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.models.StepModel;
import com.marklogic.hub.util.json.JSONUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;


class FlowControllerTest extends AbstractHubCentralTest {

    private final String flowString = "{\n" +
        "  \"name\" : \"testFlow\",\n" +
        "  \"description\" : \"\",\n" +
        "  \"batchSize\" : 100,\n" +
        "  \"threadCount\" : 4,\n" +
        "  \"stopOnError\" : false,\n" +
        "  \"options\" : { },\n" +
        "  \"version\" : 0,\n" +
        "  \"steps\" : { }\n" +
        "}";

    private final String stepString = "{\"name\":\"e2e-json\",\"description\":\"\",\"options\":{\"additionalCollections\":[]" +
        ",\"headers\":{\"sources\":[{\"name\":\"runXqyFuncFlow\"}],\"createdOn\":\"currentDateTime\",\"createdBy\":\"currentUser\"}," +
        "\"sourceQuery\":\"\",\"collections\":[\"xml-xqy\"],\"permissions\":\"data-hub-operator,read,data-hub-operator,update\"," +
        "\"outputFormat\":\"xml\",\"targetDatabase\":\"data-hub-STAGING\"},\"customHook\":{},\"retryLimit\":0,\"batchSize\":0," +
        "\"threadCount\":0,\"stepDefinitionName\":\"default-ingestion\",\"stepDefinitionType\":\"INGESTION\",\"fileLocations\":" +
        "{\"inputFilePath\":\"input\",\"inputFileType\":" +
        "\"json\",\"outputURIReplacement\":\".*/input,'/xqyfunc'\",\"separator\":\"\"}}";

    @Autowired
    FlowTestController controller;

    @Autowired
    LoadDataController loadDataController;

    @Autowired
    JobsController jobsController;

    @Test
    void getFlow() throws IOException {
        int startingFlowCount = ((List) controller.getFlows().getBody()).size();
        try {
            //POST flow
            controller.createFlow(flowString);
            Assertions.assertNotNull(controller.getFlow("testFlow"));

            //GET all flows
            ResponseEntity<?> flows = controller.getFlows();
            Assertions.assertEquals(startingFlowCount + 1, ((List) flows.getBody()).size());

            //GET all steps in a flow
            List<StepModel> steps = controller.getSteps("testFlow");
            Assertions.assertEquals(0, (steps.size()));

            ObjectMapper mapper = new ObjectMapper();
            Flow f1 = new FlowImpl();
            f1.deserialize(mapper.readTree(flowString));
            f1.setBatchSize(150);
            //PUT flow
            controller.updateFlow("testFlow", mapper.writeValueAsString(f1));

            //GET flow
            ResponseEntity<?> entity = controller.getFlow("testFlow");
            Assertions.assertEquals(150, ((FlowImpl) entity.getBody()).getBatchSize());

            //POST step
            StepModel stepModel = (StepModel) controller.createStep("testFlow", 1, stepString).getBody();
            controller.createStep("testFlow", 2, "{\"name\":\"name\",\"stepDefinitionName\":\"default-ingestion\",\"stepDefinitionType\"" +
                ":\"INGESTION\",\"options\":{\"loadData\":{\"name\":\"name\"}}}");

            JsonNode flowJson = JSONUtils.convertArtifactToJson(controller.getFlow("testFlow").getBody());

            Assertions.assertNotNull(stepModel);
            //"fileLocations" should  be present in flow declaration if already present in the step
            Assertions.assertNotNull(flowJson.get("steps").get("1"));
            Assertions.assertNotNull(flowJson.get("steps").get("1").get("fileLocations"));

            //"fileLocations" should  not be present in flow declaration if it is not present in the step
            Assertions.assertNotNull(flowJson.get("steps").get("2"));
            Assertions.assertNull(flowJson.get("steps").get("2").get("fileLocations"));

            //update batch size
            stepModel.setBatchSize(100);

            //GET all steps in a flow
            steps = controller.getSteps("testFlow");
            Assertions.assertEquals(2, (steps.size()));

            //PUT step
            controller.createStep("testFlow", "e2e-json-ingestion", mapper.writeValueAsString(stepModel));

            //link artifact to step options
            loadDataController.updateArtifact("validArtifact", newLoadDataConfig());
            controller.linkArtifact("testFlow", "e2e-json-ingestion", "loadData", "validArtifact");

            //GET step
            stepModel = (StepModel) controller.getStep("testFlow", "e2e-json-ingestion");
            Assertions.assertEquals("e2e-json", stepModel.getName());
            Assertions.assertEquals(100, stepModel.getBatchSize().intValue());
            // step should have LoadData link
            Assertions.assertTrue(stepModel.getOptions().has("loadData"), "Should have loadData link");
            Assertions.assertEquals("validArtifact", stepModel.getOptions().get("loadData").get("name").asText(), "Link should have expected name");

            // remove artifact link
            controller.removeLinkToArtifact("testFlow", "e2e-json-ingestion", "loadData", "validArtifact");
            stepModel = (StepModel) controller.getStep("testFlow", "e2e-json-ingestion");
            Assertions.assertFalse(stepModel.getOptions().has("loadData"), "Should not have loadData link");

            //DELETE step
            controller.deleteStep("testFlow", "e2e-json-ingestion");

            try {
                controller.getStep("testFlow", "e2e-json-ingestion");
                Assertions.fail();
            } catch (Exception e) {
                logger.info("Exception is expected as the step being fetched has been deleted");
            }
        } finally {
            controller.deleteFlow("testFlow");
            try {
                Flow flow = controller.getFlow("testFlow").getBody();
                Assertions.assertNull(flow, "Flow shouldn't exist anymore");
            } catch (Exception e) {
                logger.info("Exception is expected as the flow being fetched has been deleted");
            }
        }
    }

    @Test
    void runFlow() {
        installProject("run-flow-test");

        RunFlowResponse resp = controller.runFlow("testFlow", Collections.singletonList("testStep-custom"));

        assertEquals("testFlow", resp.getFlowName(), "Run flow response has correct flow name");
        controller.getLastFlowRunner().awaitCompletion();

        JsonNode job = jobsController.getJob(resp.getJobId());
        String jobStatus = job.get("jobStatus").asText();
        assertEquals("finished", jobStatus, "Job status should be 'finished' once threads complete; job doc: " + job);
    }

    @Controller
    @RequestMapping("/api/test/flows")
    static class FlowTestController extends FlowController {
        protected FlowRunnerImpl lastFlowRunner = null;

        protected FlowRunnerImpl newFlowRunner() {
            lastFlowRunner = super.newFlowRunner();
            return lastFlowRunner;
        }

        protected FlowRunnerImpl getLastFlowRunner() {
            return lastFlowRunner;
        }
    }
}
