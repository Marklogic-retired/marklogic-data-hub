package com.marklogic.hub.curation.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.oneui.Application;
import com.marklogic.hub.oneui.TestHelper;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.models.StepModel;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;


@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {Application.class, ApplicationConfig.class, FlowControllerTest.class})
class FlowControllerTest {
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

    private final String stepString = "{\"name\":\"e2e-xml\",\"description\":\"\",\"options\":{\"additionalCollections\":[]" +
            ",\"headers\":{\"sources\":[{\"name\":\"runXqyFuncFlow\"}],\"createdOn\":\"currentDateTime\",\"createdBy\":\"currentUser\"}," +
            "\"sourceQuery\":\"\",\"collections\":[\"xml-xqy\"],\"permissions\":\"data-hub-operator,read,data-hub-operator,update\"," +
            "\"outputFormat\":\"xml\",\"targetDatabase\":\"data-hub-STAGING\"},\"customHook\":{},\"retryLimit\":0,\"batchSize\":0," +
            "\"threadCount\":0,\"stepDefinitionName\":\"default-ingestion\",\"stepDefinitionType\":\"INGESTION\",\"fileLocations\":" +
            "{\"inputFilePath\":\"/Users/ssambasu/source/marklogic-data-hub/marklogic-data-hub/ye-olde-project/input\",\"inputFileType\":" +
            "\"xml\",\"outputURIReplacement\":\".*/input,'/xqyfunc'\",\"separator\":\"\"}}";

    private final String customStepString = "{\"name\":\"second\",\"description\":\"\",\"isValid\":false,\"modulePath\":\"\",\"options\":" +
            "{\"collections\":[\"second\"],\"additionalCollections\":[],\"sourceQuery\":\"cts.collectionQuery([])\",\"sourceCollection\":\"\"," +
            "\"sourceDatabase\":\"data-hub-STAGING\",\"permissions\":\"data-hub-operator,read,data-hub-operator,update\",\"outputFormat\":" +
            "\"json\",\"targetEntity\":\"\",\"targetDatabase\":\"data-hub-FINAL\"},\"customHook\":{\"module\":\"\",\"parameters\":{}," +
            "\"user\":\"\",\"runBefore\":false},\"batchSize\":100,\"threadCount\":4,\"stepDefinitionType\":\"CUSTOM\",\"stepDefType\":\"CUSTOM\"," +
            "\"stepDefinitionName\":\"second\",\"selectedSource\":\"\"}";

    @Autowired
    private FlowController controller;

    @Autowired
    private TestHelper testHelper;

    @Autowired
    private HubConfigSession hubConfig;

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @BeforeEach
    void before(){
        testHelper.authenticateSession();
    }

    @AfterEach
    void after(){
        if (controller.getFlow("testFlow") != null) {
            controller.deleteFlow("testFlow");
        }
    }

    @Test
    void getFlow() throws JsonProcessingException {
        try {
            //POST flow
            controller.createFlow(flowString);
            Assertions.assertNotNull(controller.getFlow("testFlow"));

            //GET all flows
            ResponseEntity<?> flows = controller.getFlows();
            Assertions.assertEquals(1, ((List)flows.getBody()).size());

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
            ResponseEntity<?> entity= controller.getFlow("testFlow");
            Assertions.assertEquals(150, ((FlowImpl)entity.getBody()).getBatchSize());

            //POST step
            StepModel stepModel = (StepModel)controller.createStep("testFlow", 1, stepString).getBody();

            Assertions.assertNotNull(stepModel);
            //update batch size
            stepModel.setBatchSize(100);

            //GET all steps in a flow
            steps = controller.getSteps("testFlow");
            Assertions.assertEquals(1, (steps.size()));

            //PUT step
            controller.createStep("testFlow","e2e-xml-ingestion", mapper.writeValueAsString(stepModel));
            //POST custom step
            controller.createStep("testFlow", 2, customStepString).getBody();

            GenericDocumentManager docMgr = hubConfig.newStagingClient().newDocumentManager();
            StringHandle readHandle = new StringHandle();
            docMgr.read("/step-definitions/custom/second/second.step.json").next().getContent(readHandle);
            //the step-def should be written
            Assertions.assertNotNull(readHandle.get());
            //GET step
            stepModel = (StepModel)controller.getStep("testFlow", "e2e-xml-ingestion").getBody();
            Assertions.assertEquals("e2e-xml", stepModel.getName());
            Assertions.assertEquals(100, stepModel.getBatchSize().intValue());

            //DELETE step
            controller.deleteStep("testFlow", "e2e-xml-ingestion" );
            controller.deleteStep("testFlow", "second-custom" );

            //the module should be deleted
            Assertions.assertFalse(docMgr.read("/step-definitions/custom/second/second.step.json").hasNext());
            try{
                controller.getStep("testFlow", "e2e-xml-ingestion");
                Assertions.fail();
            }
            catch (Exception e){
                logger.info("Exception is expected as the step being fetched has been deleted");
            }
        }
        finally {
            //DELETE flow
            controller.deleteFlow("testFlow");
            try{
                controller.getFlow("testFlow");
                Assertions.fail();
            }
            catch (Exception e) {
                logger.info("Exception is expected as the flow being fetched has been deleted");
            }
        }
    }

    @Test
    void runFlow() {
        controller.createFlow(flowString);
        RunFlowResponse resp = (RunFlowResponse) controller.runFlow("testFlow", null).getBody();
        Assertions.assertEquals("finished", resp.getJobStatus(), "Run flow is successfully called");
        Assertions.assertEquals("testFlow", resp.getFlowName(), "Run flow response has correct flow name");
        // TODO The current runFlow call is essentially a no-op. More complex testing will be done as part of task DHFPROD-4304
    }
}
