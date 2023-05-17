package com.marklogic.hub.step.impl;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.StepDefinitionManagerImpl;
import com.marklogic.hub.step.StepDefinition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ScriptStepRunnerTest extends AbstractHubCoreTest {

    @Autowired
    StepDefinitionManagerImpl stepDefMgr;

    @Autowired
    FlowManagerImpl flowManager;

    @BeforeEach
    public void setupEach() throws IOException {
        installProjectInFolder("step-runner-transactions-test");
    }

    @Test
    public void testCustomStepWithTransactions() {
        installModule("/custom-modules/custom/testTransactionsStep/main.sjs", "step-runner-transactions-test/src/main/ml-modules/root/custom-modules/custom/testTransactionsStep/main.sjs");
        installFinalDoc("/test/runThroughTransactions.json", new DocumentMetadataHandle().withCollections("runThroughSeparateTransactions").withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE), "step-runner-transactions-test/data/runThroughTransactions.json");
        ScriptStepRunner ssr = new ScriptStepRunner(getHubConfig().newHubClient());
        Flow flow = flowManager.getFullFlow("testFlow");
        Map<String, Step> steps = flow.getSteps();
        Step step = steps.get("1");
        StepDefinition stepDef = stepDefMgr.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());
        Map<String, Object> runtimeOptions = new HashMap<>();
        runtimeOptions.put("disableJobOutput", Boolean.TRUE);
        ssr.withStepDefinition(stepDef).withFlow(flow).withStep("1").withBatchSize(1).withThreadCount(1).withRuntimeOptions(runtimeOptions);
        ssr.run();
        ssr.awaitCompletion();
        assertEquals(1, getFinalDocCount("testTransactionsStep"), "Should create 1 new document in testTransactionsStep collection");
        assertEquals(1, getFinalDocCount("separateTransaction"), "Should create 1 new document in separateTransaction collection");
    }
}
