package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.plugin.PluginFormat;
import com.marklogic.hub.scaffold.Scaffolding;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.json.JSONException;
import org.junit.*;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Vector;
import java.util.concurrent.TimeUnit;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;

public class EndToEndTestSjsXml extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");
    private static final int TEST_SIZE = 1000;
    private static final int BATCH_SIZE = 2;

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        File projectDirFile = projectDir.toFile();
        if (projectDirFile.isDirectory() && projectDirFile.exists()) {
            FileUtils.deleteDirectory(projectDirFile);
        }

        installHub();

        Scaffolding scaffolding = new Scaffolding(projectDir.toString(), stagingClient);
        scaffolding.createEntity(ENTITY);
        scaffolding.createFlow(ENTITY, "testinput", FlowType.INPUT,
                PluginFormat.JAVASCRIPT, Format.XML);
        scaffolding.createFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
                PluginFormat.JAVASCRIPT, Format.XML);

        DataHub dh = new DataHub(getHubConfig());
        dh.clearUserModules();
        dh.installUserModules();
    }

    @Before
    public void beforeEach() {
        DataHub dh = new DataHub(getHubConfig());

        dh.clearContent(HubConfig.DEFAULT_STAGING_NAME);
        dh.clearContent(HubConfig.DEFAULT_FINAL_NAME);
        dh.clearContent(HubConfig.DEFAULT_JOB_NAME);
        dh.clearContent(HubConfig.DEFAULT_TRACE_NAME);

        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/headers/headers.sjs", "e2e-test/sjs-flow/headers/headers.sjs");
        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/triples/triples.sjs", "e2e-test/sjs-flow/triples/triples.sjs");
    }

    @AfterClass
    public static void teardown() throws IOException {
        FileUtils.deleteDirectory(projectDir.toFile());
    }

    @Test
    public void runFlows() throws IOException, ParserConfigurationException, SAXException {
        FlowManager fm = new FlowManager(getHubConfig());
        FlowRunner flowRunner = fm.newFlowRunner();
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        DataMovementManager dataMovementManager = stagingClient.newDataMovementManager();
        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".xml", handle);
        }
        dataMovementManager.startJob(writeBatcher);
        writeBatcher.awaitCompletion();

        flowRunner
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        JobTicket jobTicket = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount());
        Document expected = getXmlFromResource("e2e-test/final.xml");
        for (int i = 0; i < TEST_SIZE; i++) {
            Document actual = finalDocMgr.read("/input-" + i + ".xml").next().getContent(new DOMHandle()).get();
            assertXMLEqual(expected, actual);
        }

        JsonNode node = jobDocMgr.read("/jobs/" + jobTicket.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobTicket.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE, node.get("successfulEvents").asInt());
        Assert.assertEquals(0, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED", node.get("status").asText());
    }

    @Test
    public void runFlowsWithFailures() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/headers/headers.sjs", "e2e-test/sjs-flow/headers/headers-with-error.sjs");

        FlowManager fm = new FlowManager(getHubConfig());
        FlowRunner flowRunner = fm.newFlowRunner();
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        DataMovementManager dataMovementManager = stagingClient.newDataMovementManager();
        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".xml", handle);
        }
        dataMovementManager.startJob(writeBatcher);
        writeBatcher.flushAndWait();
        writeBatcher.awaitCompletion();

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        flowRunner
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .onItemComplete((String jobId, String itemId) -> {
                logger.info(itemId);
                completed.add(itemId);
            })
            .onItemFailed((String jobId, String itemId) -> {
                failed.add(itemId);
            });

        JobTicket jobTicket = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE - 1, getFinalDocCount());
        Assert.assertEquals(TEST_SIZE - 1, completed.size());
        Assert.assertEquals(1, failed.size());
        JsonNode node = jobDocMgr.read("/jobs/" + jobTicket.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobTicket.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE - 1, node.get("successfulEvents").asInt());
        Assert.assertEquals(1, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED_WITH_ERRORS", node.get("status").asText());
    }

    @Test
    public void runFlowsDontWait() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowManager fm = new FlowManager(getHubConfig());
        FlowRunner flowRunner = fm.newFlowRunner();
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        DataMovementManager dataMovementManager = stagingClient.newDataMovementManager();
        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".xml", handle);
        }
        dataMovementManager.startJob(writeBatcher);
        writeBatcher.flushAndWait();
        writeBatcher.awaitCompletion();

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
