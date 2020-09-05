package com.marklogic.hub.step.impl;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.StepDefinitionManagerImpl;
import com.marklogic.hub.step.StepDefinition;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.SystemUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.matchesPattern;

public class WriteStepRunnerTest extends AbstractHubCoreTest {

    @Autowired
    StepDefinitionManagerImpl stepDefMgr;

    @Autowired
    FlowManagerImpl flowManager;

    @BeforeEach
    public void setupEach() throws IOException {
        FileUtils.copyDirectory(getResourceFile("flow-runner-test/flows"), getHubConfig().getFlowsDir().toFile());
        installUserModules(runAsFlowDeveloper(), true);
    }

    @Test
    public void testRunningPercent() {
        WriteStepRunner wsr = new WriteStepRunner(getHubConfig().newHubClient(), getHubProject());
        Flow flow = flowManager.getFullFlow("testFlow");
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
        wsr.withStep("1").withOptions(new HashMap<String, Object>());
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

    @Test
    public void testOutputUriPrefix() {
        WriteStepRunner wsr = new WriteStepRunner(getHubConfig().newHubClient(), getHubConfig().getHubProject());
        Flow flow = flowManager.getFullFlow("testCsvLoadData");
        Map<String, Step> steps = flow.getSteps();
        Step step = steps.get("1");
        StepDefinition stepDef = stepDefMgr.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());
        wsr.withStepDefinition(stepDef).withFlow(flow).withStep("1").withBatchSize(1).withOptions(new HashMap<String, Object>())
            .withJobId(UUID.randomUUID().toString());
        wsr.loadStepRunnerParameters();
        Assertions.assertEquals("csv", wsr.inputFileType, "Input file type should be 'csv'");
        Assertions.assertEquals("json", wsr.outputFormat, "Output format should be 'json'");
        Assertions.assertEquals(".*/input,''", wsr.outputURIReplacement, "output URI replacement format should be '.*/input,'''");
        //if 'outputURIReplacement' is set and 'outputURIPrefix' is not set, it will remain null
        Assertions.assertEquals(null, wsr.outputURIPrefix, "output URI prefix format should be null");
        Assertions.assertEquals(",", wsr.separator, "separator should be ','");

        Map<String, Object> stepConfig = new HashMap<>();
        Map<String, Object> fileLocations = new HashMap<>();
        fileLocations.put("outputURIReplacement", null);
        fileLocations.put("outputURIPrefix", null);
        stepConfig.put("fileLocations", fileLocations);

        wsr.withStepDefinition(stepDef).withFlow(flow).withStep("1").withBatchSize(1).withStepConfig(stepConfig)
            .withJobId(UUID.randomUUID().toString());
        wsr.loadStepRunnerParameters();

        Assertions.assertEquals(null, wsr.outputURIReplacement, "output URI replacement should be null");
        //if 'outputURIReplacement' and 'outputURIPrefix' are not set, 'outputURIPrefix' will be set to ""
        Assertions.assertEquals("", wsr.outputURIPrefix, "output URI prefix will be set to empty string as" +
            "outputURIReplacement is null");

    }

    @Test
    void getPrefixedEncodedURI() throws URISyntaxException {
        WriteStepRunner wsr = new WriteStepRunner(getHubConfig().newHubClient(), getHubConfig().getHubProject());
        wsr.outputURIPrefix = "/prefix/";

        Assertions.assertEquals("/prefix/test1.json", wsr.getPrefixedEncodedURI("test1.json"));
        Assertions.assertEquals("/prefix/test%201.json", wsr.getPrefixedEncodedURI("test 1.json"));
        Assertions.assertEquals("/prefix/test1.xml", wsr.getPrefixedEncodedURI("test1.xml"));

        wsr.outputURIPrefix = "";
        Assertions.assertEquals("test1.json", wsr.getPrefixedEncodedURI("test1.json"));
        Assertions.assertEquals("test%201.json", wsr.getPrefixedEncodedURI("test 1.json"));

        Flow flow = flowManager.getFullFlow("testCsvLoadData");
        Map<String, Step> steps = flow.getSteps();
        Step step = steps.get("1");
        StepDefinition stepDef = stepDefMgr.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());
        wsr.withStepDefinition(stepDef).withFlow(flow).withStep("1").withOptions(new HashMap<String, Object>());

        Map<String,Object> stepConfig = new HashMap<>();
        Map<String, Object> fileLocations = new HashMap<>();
        //flow already has 'outputURIReplacement', adding 'outputURIPrefix' should throw an error
        fileLocations.put("outputURIPrefix", "/prefix/");
        stepConfig.put("fileLocations", fileLocations);

        wsr.withStepConfig(stepConfig);
        try{
            wsr.loadStepRunnerParameters();
            Assertions.assertTrue(false);
        }
        catch (Exception e){
            Assertions.assertEquals("'outputURIPrefix' and 'outputURIReplacement' cannot be set simultaneously", e.getMessage());
        }

    }

    @Test
    void generateUriForCsv() {
        WriteStepRunner wsr = new WriteStepRunner(getHubConfig().newHubClient(), getHubConfig().getHubProject());
        wsr.outputURIPrefix = "/prefix";
        wsr.outputFormat = "json";
        assertThat(wsr.generateUriForCsv("/abc", SystemUtils.OS_NAME.toLowerCase()), matchesPattern(expectedPattern(null, wsr)));
        assertThat(wsr.generateUriForCsv("C:\\abc\\def", "windows 10"), matchesPattern(expectedPattern(null, wsr)));
        wsr.outputFormat = "xml";
        assertThat(wsr.generateUriForCsv("/abc", SystemUtils.OS_NAME.toLowerCase()), matchesPattern(expectedPattern(null, wsr)));
        assertThat(wsr.generateUriForCsv("C:\\abc\\def", "windows 10"), matchesPattern(expectedPattern(null, wsr)));

        wsr.outputURIPrefix = "";
        wsr.outputFormat = "json";
        assertThat(wsr.generateUriForCsv("/abc", SystemUtils.OS_NAME.toLowerCase()), matchesPattern(expectedPattern("", wsr)));
        assertThat(wsr.generateUriForCsv("C:\\abc\\def", "windows 10"), matchesPattern(expectedPattern("", wsr)));


        wsr.outputURIPrefix = null;
        wsr.outputFormat = "json";

        if(!SystemUtils.OS_NAME.toLowerCase().contains("windows")){
            assertThat(wsr.generateUriForCsv("/abc", SystemUtils.OS_NAME.toLowerCase()), matchesPattern(expectedPattern("/abc", wsr)));
        }
        assertThat(wsr.generateUriForCsv("C:\\abc\\def", "windows 10"), matchesPattern(expectedPattern("/C/abc/def", wsr)));

        wsr.outputURIReplacement = ".*abc,''";
        assertThat(wsr.generateUriForCsv("/abc", SystemUtils.OS_NAME.toLowerCase()), matchesPattern(expectedPattern("", wsr)));
        assertThat(wsr.generateUriForCsv("C:\\abc\\def", "windows 10"), matchesPattern(expectedPattern("/def", wsr)));
    }

    private String expectedPattern(String path, WriteStepRunner wsr){
        String commonPattern = new StringBuilder().append("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}.").append(wsr.outputFormat).toString();
        if(wsr.outputURIPrefix != null){
            return new StringBuilder().append(wsr.outputURIPrefix).append(commonPattern).toString();
        }
        else{
            return new StringBuilder().append(path).append("/").append(commonPattern).toString();
        }

    }
}
