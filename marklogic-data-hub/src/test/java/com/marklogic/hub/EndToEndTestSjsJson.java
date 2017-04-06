package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.plugin.PluginFormat;
import com.marklogic.hub.scaffold.Scaffolding;
import org.apache.commons.io.FileUtils;
import org.json.JSONException;
import org.junit.*;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.batch.core.JobExecution;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Vector;
import java.util.concurrent.TimeUnit;

public class EndToEndTestSjsJson extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");
    private static final int TEST_SIZE = 500;
    private static final int BATCH_SIZE = 10;
    private static FlowManager flowManager;

    @BeforeClass
    public static void setup() throws IOException {
        File projectDirFile = projectDir.toFile();
        if (projectDirFile.isDirectory() && projectDirFile.exists()) {
            FileUtils.deleteDirectory(projectDirFile);
        }

        installHub();

        Scaffolding scaffolding = new Scaffolding(projectDir.toString());
        scaffolding.createEntity(ENTITY);
        scaffolding.createFlow(ENTITY, "testinput", FlowType.INPUT,
            PluginFormat.JAVASCRIPT, Format.JSON);
        scaffolding.createFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
            PluginFormat.JAVASCRIPT, Format.JSON);

        getDataHub().clearUserModules();
        getDataHub().installUserModules();
        flowManager = new FlowManager(getHubConfig());
    }

    @Before
    public void beforeEach() {
        clearDatabases(new String[]{HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME, HubConfig.DEFAULT_TRACE_NAME});

        HashMap<String, String> modules = new HashMap<>();
        modules.put("/entities/" + ENTITY + "/harmonize/testharmonize/headers/headers.sjs", "e2e-test/sjs-flow/headers/headers.sjs");
        modules.put("/entities/" + ENTITY + "/harmonize/testharmonize/triples/triples.sjs", "e2e-test/sjs-flow/triples/triples.sjs");
        installModules(modules);
    }

    @AfterClass
    public static void teardown() throws IOException {
        FileUtils.deleteDirectory(projectDir.toFile());
    }

    @Test
    public void runFlows() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        DocumentWriteSet documentWriteSet = stagingDocMgr.newWriteSet();
        for (int i = 0; i < TEST_SIZE; i++) {
            documentWriteSet.add("/input-" + i + ".json", handle);
        }
        stagingDocMgr.write(documentWriteSet);

        flowRunner
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        JobExecution jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount());
        String expected = getResource("e2e-test/final.json");
        for (int i = 0; i < TEST_SIZE; i++) {
            String actual = finalDocMgr.read("/input-" + i + ".json").next().getContent(new StringHandle()).get();
            JSONAssert.assertEquals(expected, actual, false);
        }

        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        String nodeStr = node.toString();
        logger.info(nodeStr);
        Assert.assertEquals(nodeStr, Long.toString(jobExecution.getJobId()), node.get("jobId").asText());
        Assert.assertEquals(nodeStr, TEST_SIZE, node.get("successfulEvents").asInt());
        Assert.assertEquals(nodeStr, 0, node.get("failedEvents").asInt());
        Assert.assertEquals(nodeStr, TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(nodeStr, 0, node.get("failedBatches").asInt());
        Assert.assertEquals(nodeStr, "FINISHED", node.get("status").asText());
    }

    @Test
    public void runFlowsWithFailures() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/headers/headers.sjs", "e2e-test/sjs-flow/headers/headers-with-error.sjs");

        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));

        DocumentWriteSet documentWriteSet = stagingDocMgr.newWriteSet();
        for (int i = 0; i < TEST_SIZE; i++) {
            documentWriteSet.add("/input-" + i + ".json", handle);
        }
        stagingDocMgr.write(documentWriteSet);

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        flowRunner
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .onItemComplete((String jobId, String itemId) -> {
                completed.add(itemId);
            })
            .onItemFailed((String jobId, String itemId) -> {
                failed.add(itemId);
            });


        JobExecution jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE - 1, getFinalDocCount());
        Assert.assertEquals(TEST_SIZE - 1, completed.size());
        Assert.assertEquals(1, failed.size());
        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(Long.toString(jobExecution.getJobId()), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE - 1, node.get("successfulEvents").asInt());
        Assert.assertEquals(1, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED_WITH_ERRORS", node.get("status").asText());

    }

    @Test
    public void runFlowsDontWait() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));

        DocumentWriteSet documentWriteSet = stagingDocMgr.newWriteSet();
        for (int i = 0; i < TEST_SIZE; i++) {
            documentWriteSet.add("/input-" + i + ".json", handle);
        }
        stagingDocMgr.write(documentWriteSet);

        flowRunner
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        flowRunner.run();

        try {
            flowRunner.awaitCompletion(2, TimeUnit.MILLISECONDS);
        } catch(InterruptedException e) {

        }

        Assert.assertNotEquals(TEST_SIZE, getFinalDocCount());
    }
}
