package com.marklogic.hub;

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
import org.json.JSONException;
import org.junit.*;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.batch.core.JobExecution;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPathExpressionException;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.Vector;
import java.util.concurrent.TimeUnit;

public class EndToEndTestXqyJson extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");
    private static final int TEST_SIZE = 50;
    private static final int BATCH_SIZE = 10;

    @BeforeClass
    public static void setup() throws IOException {
        File projectDirFile = projectDir.toFile();
        if (projectDirFile.isDirectory() && projectDirFile.exists()) {
            FileUtils.deleteDirectory(projectDirFile);
        }

        installHub();

        enableDebugging();
        enableTracing();

        Scaffolding scaffolding = new Scaffolding(projectDir.toString());
        scaffolding.createEntity(ENTITY);
        scaffolding.createFlow(ENTITY, "testinput", FlowType.INPUT,
            PluginFormat.XQUERY, Format.JSON);
        scaffolding.createFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
            PluginFormat.XQUERY, Format.JSON);

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

        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/headers/headers.xqy", "e2e-test/xqy-flow/headers/headers-json.xqy");
        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/triples/triples.xqy", "e2e-test/xqy-flow/triples/triples.xqy");
    }


    @AfterClass
    public static void teardown() throws IOException {
        FileUtils.deleteDirectory(projectDir.toFile());
    }

    @Test
    public void runFlowwithTriplesNodeStar() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowManager fm = new FlowManager(getHubConfig());
        FlowRunner flowRunner = fm.newFlowRunner();
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        for (int i = 0; i < TEST_SIZE; i++) {
            stagingDocMgr.write("/input-" + i + ".json", handle);
        }

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

        Document doc = jobDocMgr.read("/projects.spring.io/spring-batch/" + jobExecution.getJobId() + ".xml").next().getContent(new DOMHandle()).get();

        try {
            Assert.assertEquals(jobExecution.getJobId().toString(), xpath.evaluate("//msb:jobInstance/msb:id", doc.getDocumentElement()));
        } catch (XPathExpressionException e) {
            Assert.fail();
        }
    }

    @Test
    public void runFlowWithTriplesJsonArray() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/triples/triples.xqy", "e2e-test/xqy-flow/triples/triples-json-array.xqy");

        FlowManager fm = new FlowManager(getHubConfig());
        FlowRunner flowRunner = fm.newFlowRunner();
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        for (int i = 0; i < TEST_SIZE; i++) {
            stagingDocMgr.write("/input-" + i + ".json", handle);
        }

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

        Document doc = jobDocMgr.read("/projects.spring.io/spring-batch/" + jobExecution.getJobId() + ".xml").next().getContent(new DOMHandle()).get();

        try {
            Assert.assertEquals(jobExecution.getJobId().toString(), xpath.evaluate("//msb:jobInstance/msb:id", doc.getDocumentElement()));
        } catch (XPathExpressionException e) {
            Assert.fail();
        }
    }

    @Test
    public void runFlowsWithFailures() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/headers/headers.xqy", "e2e-test/xqy-flow/headers/headers-json-with-error.xqy");

        FlowManager fm = new FlowManager(getHubConfig());
        FlowRunner flowRunner = fm.newFlowRunner();
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        for (int i = 0; i < TEST_SIZE; i++) {
            stagingDocMgr.write("/input-" + i + ".json", handle);
        }

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();
        flowRunner
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .onItemComplete((long jobId, String itemId) -> {
                logger.info(itemId);
                completed.add(itemId);
            })
            .onItemFailed((long jobId, String itemId) -> {
                failed.add(itemId);
            });

        JobExecution jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        completed.sort(Comparator.naturalOrder());
        Assert.assertEquals(TEST_SIZE - 1, getFinalDocCount());
        Assert.assertEquals(TEST_SIZE - 1, completed.size());
        Assert.assertEquals(1, failed.size());
        Assert.assertEquals("/input-2.json", failed.get(0));
        Document doc = jobDocMgr.read("/projects.spring.io/spring-batch/" + jobExecution.getJobId() + ".xml").next().getContent(new DOMHandle()).get();

        try {
            Assert.assertEquals(jobExecution.getJobId().toString(), xpath.evaluate("//msb:jobInstance/msb:id", doc.getDocumentElement()));
        } catch (XPathExpressionException e) {
            Assert.fail();
        }
    }

    @Test
    public void runFlowsDontWait() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowManager fm = new FlowManager(getHubConfig());
        FlowRunner flowRunner = fm.newFlowRunner();
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        for (int i = 0; i < TEST_SIZE; i++) {
            stagingDocMgr.write("/input-" + i + ".json", handle);
        }

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
