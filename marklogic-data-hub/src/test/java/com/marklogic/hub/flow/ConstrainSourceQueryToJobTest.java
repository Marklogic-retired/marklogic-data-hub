package com.marklogic.hub.flow;

import com.marklogic.bootstrap.Installer;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.step.RunStepResponse;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class ConstrainSourceQueryToJobTest extends HubTestBase {

    @Autowired
    FlowRunnerImpl flowRunner;

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().deleteProjectDir();
    }

    @AfterAll
    public static void cleanUp() {
        new Installer().deleteProjectDir();
    }

    @BeforeEach
    public void setupEach() {
        setupProjectForRunningTestFlow();
        getHubFlowRunnerConfig();
    }

    @Test
    public void test() {
        RunFlowResponse flowResponse = flowRunner.runFlow("testFlow", Arrays.asList("1"), "job1", null, null);
        flowRunner.awaitCompletion();
        RunStepResponse stepResponse = flowResponse.getStepResponses().get("1");
        assertEquals("job1", stepResponse.getJobId());
        assertEquals(1, stepResponse.getSuccessfulBatches(), "The XML document should have been ingested successfully");

        final String mapXmlStep = "6";

        final Map<String, Object> options = new HashMap<>();
        options.put("constrainSourceQueryToJob", true);

        flowResponse = flowRunner.runFlow("testFlow", Arrays.asList(mapXmlStep), "job2", options, null);
        flowRunner.awaitCompletion();
        stepResponse = flowResponse.getStepResponses().get(mapXmlStep);
        assertEquals(0, stepResponse.getSuccessfulBatches(), "Since the sourceQuery was constrained to job2, and " +
            "no documents have that value for their datahubCreatedByJob metadata key, then nothing should have been processed");

        flowResponse = flowRunner.runFlow("testFlow", Arrays.asList(mapXmlStep), "job1", options, null);
        flowRunner.awaitCompletion();
        stepResponse = flowResponse.getStepResponses().get(mapXmlStep);
        assertEquals(1, stepResponse.getSuccessfulBatches(), "Since the sourceQuery was constrained to job1, and the " +
            "ingestion step was executed before with that jobId, then the ingested XML document should have been processed");
    }
}
