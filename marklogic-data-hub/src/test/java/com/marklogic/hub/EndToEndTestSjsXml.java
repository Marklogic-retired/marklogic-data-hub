package com.marklogic.hub;

import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.Format;
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
import org.springframework.batch.core.JobExecution;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPathExpressionException;
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
    private static final int BATCH_SIZE = 10;

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);


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

        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            stagingDocMgr.write("/input-" + i + ".xml", handle);
        }

        flowRunner
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);


        JobExecution jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount());
        Document expected = getXmlFromResource("e2e-test/final.xml");
        for (int i = 0; i < TEST_SIZE; i++) {
            Document actual = finalDocMgr.read("/input-" + i + ".xml").next().getContent(new DOMHandle()).get();
            assertXMLEqual(expected, actual);
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
        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/headers/headers.sjs", "e2e-test/sjs-flow/headers/headers-with-error.sjs");

        FlowManager fm = new FlowManager(getHubConfig());
        FlowRunner flowRunner = fm.newFlowRunner();
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            stagingDocMgr.write("/input-" + i + ".xml", handle);
        }

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        flowRunner
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .onItemComplete((long jobId, String itemId) -> {
                completed.add(itemId);
            })
            .onItemFailed((long jobId, String itemId) -> {
                failed.add(itemId);
            });

        JobExecution jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE - 1, getFinalDocCount());
        Assert.assertEquals(TEST_SIZE - 1, completed.size());
        Assert.assertEquals(1, failed.size());
        Document doc = jobDocMgr.read("/projects.spring.io/spring-batch/" + jobExecution.getJobId() + ".xml").next().getContent(new DOMHandle()).get();

        try {
            Assert.assertEquals(jobExecution.getJobId().toString(), xpath.evaluate("//msb:jobInstance/msb:id", doc.getDocumentElement()));
        } catch (XPathExpressionException e) {
            Assert.fail();
        }

//        doc.getDocumentElement().get.getElementsByTagNameNS("http://marklogic.com/spring-batch", "jobInstance").item(0)
//        Assert.assertEquals(jobTicket.getJobId(), node.get("jobId").asText());
//        Assert.assertEquals(testSize - 1, node.get("successfulEvents").asInt());
//        Assert.assertEquals(1, node.get("failedEvents").asInt());
//        Assert.assertEquals(testSize / batchSize, node.get("successfulBatches").asInt());
//        Assert.assertEquals(0, node.get("failedBatches").asInt());
//        Assert.assertEquals("FINISHED_WITH_ERRORS", node.get("status").asText());
    }

    @Test
    public void runFlowsDontWait() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowManager fm = new FlowManager(getHubConfig());
        FlowRunner flowRunner = fm.newFlowRunner();
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            stagingDocMgr.write("/input-" + i + ".xml", handle);
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
