package com.marklogic.hub.step.impl;

import com.marklogic.bootstrap.Installer;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.StepDefinitionManagerImpl;
import com.marklogic.hub.step.StepDefinition;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class WriteStepRunnerTest extends HubTestBase {

    @Autowired
    private HubConfigImpl hubConfig;
    @Autowired
    private StepDefinitionManagerImpl stepDefMgr;
    @Autowired
    private FlowManagerImpl flowManager;

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().deleteProjectDir();
    }

    @BeforeEach
    public void setupEach() throws IOException {
        basicSetup();
        getDataHubAdminConfig();
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
        FileUtils.copyDirectory(getResourceFile("flow-runner-test/flows"), hubConfig.getFlowsDir().toFile());
        installUserModules(getDataHubAdminConfig(), true);
    }

    @AfterAll
    public static void cleanUp(){
        new Installer().deleteProjectDir();
    }

    @Test
    public void testRunningPercent() {
        WriteStepRunner wsr = new WriteStepRunner(hubConfig);
        Flow flow = flowManager.getFlow("testFlow");
        Map<String, Step> steps = flow.getSteps();
        Step step = steps.get("3");
        StepDefinition stepDef = stepDefMgr.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());
        wsr.withStepDefinition(stepDef).withFlow(flow).withStep("3").withBatchSize(1).withOptions(new HashMap<String, Object>())
            .withJobId(UUID.randomUUID().toString());
        wsr.loadStepRunnerParameters();
        Collection<String> files = Arrays.asList("firstFile", "secondFile", "thirdFile","fourthFile", "fifthFile");
        StepMetrics stepMetrics = new StepMetrics();
        final AtomicInteger percent = new AtomicInteger(0);
        wsr.onStatusChanged((jobId, percentComplete, status, successfulEvents, failedEvents,  message)->{
            percent.addAndGet(20);
            Assertions.assertTrue(percent.get() == percentComplete);
            if(percent.get() == 100) {
                percent.set(0);
            }
        });

        //test csv 'inputFileType'
        Runnable csvTask = ()->{
            files.stream().forEach(uri->{
                logger.info("Processing csv file: "+ uri);
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {}
                wsr.csvFilesProcessed++;
                wsr.runStatusListener(files.size(),stepMetrics);
            });
        };
        csvTask.run();

        //test xml 'inputFileType'
        wsr.withStep("1");
        wsr.loadStepRunnerParameters();

        Runnable xmlTask = ()->{
            files.stream().forEach(uri->{
                logger.info("Processing xml file: "+ uri);
                try {
                    Thread.sleep(500);
                } catch (InterruptedException e) {}
                stepMetrics.getSuccessfulEvents().incrementAndGet();
                stepMetrics.getSuccessfulBatches().incrementAndGet();
                wsr.runStatusListener(files.size(),stepMetrics);
            });
        };
        xmlTask.run();
    }
}
