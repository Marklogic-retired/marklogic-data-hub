package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.datamovement.*;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.*;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.MlcpRunner;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.json.JSONException;
import org.junit.*;
import org.skyscreamer.jsonassert.JSONAssert;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.Vector;
import java.util.concurrent.TimeUnit;

import static junit.framework.Assert.assertEquals;
import static junit.framework.Assert.assertFalse;
import static junit.framework.Assert.assertTrue;
import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;

public class EndToEndFlowTests extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");
    private static final int TEST_SIZE = 1000;
    private static final int BATCH_SIZE = 10;
    private static FlowManager flowManager;
    private static DataMovementManager dataMovementManager;

    private boolean installDocsFinished = false;
    private boolean installDocsFailed = false;
    private String installDocError;

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        File projectDirFile = projectDir.toFile();
        if (projectDirFile.isDirectory() && projectDirFile.exists()) {
            FileUtils.deleteDirectory(projectDirFile);
        }

        installHub();

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);

        enableDebugging();

        enableTracing();

        Scaffolding scaffolding = new Scaffolding(projectDir.toString(), stagingClient);
        scaffolding.createEntity(ENTITY);

        scaffolding.createFlow(ENTITY, "sjs-json", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "sjs-json-input-flow", FlowType.INPUT,
            CodeFormat.JAVASCRIPT, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "sjs-json-no-wait", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "sjs-json-errors", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "sjs-json-failed-main", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "sjs-xml", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.XML);

        scaffolding.createFlow(ENTITY, "sjs-xml-input-flow", FlowType.INPUT,
            CodeFormat.JAVASCRIPT, DataFormat.XML);

        scaffolding.createFlow(ENTITY, "sjs-xml-no-wait", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.XML);

        scaffolding.createFlow(ENTITY, "sjs-xml-errors", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.XML);

        scaffolding.createFlow(ENTITY, "sjs-xml-failed-main", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.XML);

        scaffolding.createFlow(ENTITY, "xqy-json", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "xqy-json-input-flow", FlowType.INPUT,
            CodeFormat.XQUERY, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "xqy-json-no-wait", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "xqy-json-errors", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "xqy-json-failed-main", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "xqy-json-triples-array", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "xqy-xml", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML);

        scaffolding.createFlow(ENTITY, "xqy-xml-input-flow", FlowType.INPUT,
            CodeFormat.XQUERY, DataFormat.XML);

        scaffolding.createFlow(ENTITY, "xqy-xml-no-wait", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML);

        scaffolding.createFlow(ENTITY, "xqy-xml-errors", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML);

        scaffolding.createFlow(ENTITY, "xqy-xml-failed-main", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML);

        scaffolding.createFlow(ENTITY, "scaffolded-xqy-json", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "scaffolded-xqy-xml", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML);

        scaffolding.createFlow(ENTITY, "scaffolded-sjs-json", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "scaffolded-sjs-xml", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.XML);

        Path harmonizeDir = projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize");
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector.sjs"), harmonizeDir.resolve("sjs-json/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers.sjs"), harmonizeDir.resolve("sjs-json/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content.sjs"), harmonizeDir.resolve("sjs-json/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples.sjs"), harmonizeDir.resolve("sjs-json/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writer.sjs"), harmonizeDir.resolve("sjs-json/writer.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers.sjs"), harmonizeDir.resolve("sjs-json-input-flow/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content-input.sjs"), harmonizeDir.resolve("sjs-json-input-flow/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples.sjs"), harmonizeDir.resolve("sjs-json-input-flow/triples.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector.sjs"), harmonizeDir.resolve("sjs-json-no-wait/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers.sjs"), harmonizeDir.resolve("sjs-json-no-wait/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content.sjs"), harmonizeDir.resolve("sjs-json-no-wait/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples.sjs"), harmonizeDir.resolve("sjs-json-no-wait/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writer.sjs"), harmonizeDir.resolve("sjs-json-no-wait/writer.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector.sjs"), harmonizeDir.resolve("sjs-json-errors/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers-with-error.sjs"), harmonizeDir.resolve("sjs-json-errors/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content.sjs"), harmonizeDir.resolve("sjs-json-errors/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples.sjs"), harmonizeDir.resolve("sjs-json-errors/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writer.sjs"), harmonizeDir.resolve("sjs-json-errors/writer.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector.sjs"), harmonizeDir.resolve("sjs-json-failed-main/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers.sjs"), harmonizeDir.resolve("sjs-json-failed-main/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content.sjs"), harmonizeDir.resolve("sjs-json-failed-main/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples.sjs"), harmonizeDir.resolve("sjs-json-failed-main/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writer.sjs"), harmonizeDir.resolve("sjs-json-failed-main/writer.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/main-with-error.sjs"), harmonizeDir.resolve("sjs-json-failed-main/main.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector.sjs"), harmonizeDir.resolve("sjs-xml/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers.sjs"), harmonizeDir.resolve("sjs-xml/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content.sjs"), harmonizeDir.resolve("sjs-xml/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples.sjs"), harmonizeDir.resolve("sjs-xml/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writer.sjs"), harmonizeDir.resolve("sjs-xml/writer.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers.sjs"), harmonizeDir.resolve("sjs-xml-input-flow/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content-input.sjs"), harmonizeDir.resolve("sjs-xml-input-flow/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples.sjs"), harmonizeDir.resolve("sjs-xml-input-flow/triples.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector.sjs"), harmonizeDir.resolve("sjs-xml-no-wait/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers.sjs"), harmonizeDir.resolve("sjs-xml-no-wait/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content.sjs"), harmonizeDir.resolve("sjs-xml-no-wait/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples.sjs"), harmonizeDir.resolve("sjs-xml-no-wait/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writer.sjs"), harmonizeDir.resolve("sjs-xml-no-wait/writer.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector.sjs"), harmonizeDir.resolve("sjs-xml-errors/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers-with-error.sjs"), harmonizeDir.resolve("sjs-xml-errors/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content.sjs"), harmonizeDir.resolve("sjs-xml-errors/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples.sjs"), harmonizeDir.resolve("sjs-xml-errors/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writer.sjs"), harmonizeDir.resolve("sjs-xml-errors/writer.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector.sjs"), harmonizeDir.resolve("sjs-xml-failed-main/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers.sjs"), harmonizeDir.resolve("sjs-xml-failed-main/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content.sjs"), harmonizeDir.resolve("sjs-xml-failed-main/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples.sjs"), harmonizeDir.resolve("sjs-xml-failed-main/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writer.sjs"), harmonizeDir.resolve("sjs-xml-failed-main/writer.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/main-with-error.sjs"), harmonizeDir.resolve("sjs-xml-failed-main/main.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector.xqy"), harmonizeDir.resolve("xqy-json/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers-json.xqy"), harmonizeDir.resolve("xqy-json/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content.xqy"), harmonizeDir.resolve("xqy-json/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples.xqy"), harmonizeDir.resolve("xqy-json/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writer.xqy"), harmonizeDir.resolve("xqy-json/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers-json.xqy"), harmonizeDir.resolve("xqy-json-input-flow/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content-input.xqy"), harmonizeDir.resolve("xqy-json-input-flow/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples.xqy"), harmonizeDir.resolve("xqy-json-input-flow/triples.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector.xqy"), harmonizeDir.resolve("xqy-json-no-wait/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers-json.xqy"), harmonizeDir.resolve("xqy-json-no-wait/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content.xqy"), harmonizeDir.resolve("xqy-json-no-wait/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples.xqy"), harmonizeDir.resolve("xqy-json-no-wait/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writer.xqy"), harmonizeDir.resolve("xqy-json-no-wait/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector.xqy"), harmonizeDir.resolve("xqy-json-errors/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers-json-with-error.xqy"), harmonizeDir.resolve("xqy-json-errors/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content.xqy"), harmonizeDir.resolve("xqy-json-errors/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples.xqy"), harmonizeDir.resolve("xqy-json-errors/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writer.xqy"), harmonizeDir.resolve("xqy-json-errors/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector.xqy"), harmonizeDir.resolve("xqy-json-failed-main/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers-json.xqy"), harmonizeDir.resolve("xqy-json-failed-main/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content.xqy"), harmonizeDir.resolve("xqy-json-failed-main/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples.xqy"), harmonizeDir.resolve("xqy-json-failed-main/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writer.xqy"), harmonizeDir.resolve("xqy-json-failed-main/writer.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/main-with-error.xqy"), harmonizeDir.resolve("xqy-json-failed-main/main.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector.xqy"), harmonizeDir.resolve("xqy-json-triples-array/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers-json.xqy"), harmonizeDir.resolve("xqy-json-triples-array/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content.xqy"), harmonizeDir.resolve("xqy-json-triples-array/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples-json-array.xqy"), harmonizeDir.resolve("xqy-json-triples-array/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writer.xqy"), harmonizeDir.resolve("xqy-json-triples-array/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector.xqy"), harmonizeDir.resolve("xqy-xml/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers-xml.xqy"), harmonizeDir.resolve("xqy-xml/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content.xqy"), harmonizeDir.resolve("xqy-xml/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples.xqy"), harmonizeDir.resolve("xqy-xml/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writer.xqy"), harmonizeDir.resolve("xqy-xml/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers-xml.xqy"), harmonizeDir.resolve("xqy-xml-input-flow/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content-input.xqy"), harmonizeDir.resolve("xqy-xml-input-flow/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples.xqy"), harmonizeDir.resolve("xqy-xml-input-flow/triples.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector.xqy"), harmonizeDir.resolve("xqy-xml-no-wait/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers-xml.xqy"), harmonizeDir.resolve("xqy-xml-no-wait/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content.xqy"), harmonizeDir.resolve("xqy-xml-no-wait/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples.xqy"), harmonizeDir.resolve("xqy-xml-no-wait/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writer.xqy"), harmonizeDir.resolve("xqy-xml-no-wait/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector.xqy"), harmonizeDir.resolve("xqy-xml-errors/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers-xml-with-error.xqy"), harmonizeDir.resolve("xqy-xml-errors/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content.xqy"), harmonizeDir.resolve("xqy-xml-errors/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples.xqy"), harmonizeDir.resolve("xqy-xml-errors/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writer.xqy"), harmonizeDir.resolve("xqy-xml-errors/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector.xqy"), harmonizeDir.resolve("xqy-xml-failed-main/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers-xml.xqy"), harmonizeDir.resolve("xqy-xml-failed-main/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content.xqy"), harmonizeDir.resolve("xqy-xml-failed-main/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples.xqy"), harmonizeDir.resolve("xqy-xml-failed-main/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writer.xqy"), harmonizeDir.resolve("xqy-xml-failed-main/writer.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/main-with-error.xqy"), harmonizeDir.resolve("xqy-xml-failed-main/main.xqy").toFile());


        harmonizeDir.resolve("legacy-sjs-json").resolve("collector").toFile().mkdirs();
        harmonizeDir.resolve("legacy-sjs-json").resolve("content").toFile().mkdirs();
        harmonizeDir.resolve("legacy-sjs-json").resolve("headers").toFile().mkdirs();
        harmonizeDir.resolve("legacy-sjs-json").resolve("triples").toFile().mkdirs();
        harmonizeDir.resolve("legacy-sjs-json").resolve("writer").toFile().mkdirs();
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector.sjs"), harmonizeDir.resolve("legacy-sjs-json/collector/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers.sjs"), harmonizeDir.resolve("legacy-sjs-json/headers/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content.sjs"), harmonizeDir.resolve("legacy-sjs-json/content/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples.sjs"), harmonizeDir.resolve("legacy-sjs-json/triples/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writer.sjs"), harmonizeDir.resolve("legacy-sjs-json/writer/writer.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/legacy-main.sjs"), harmonizeDir.resolve("legacy-sjs-json/main.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/legacy-sjs-json.xml"), harmonizeDir.resolve("legacy-sjs-json/legacy-sjs-json.xml").toFile());

        getDataHub().installUserModules();

        flowManager = new FlowManager(getHubConfig());
        dataMovementManager = stagingClient.newDataMovementManager();
    }

    @After
    public void hangout() throws InterruptedException {
        Thread.sleep(500);
    }
//    @AfterClass
//    public static void teardown() throws IOException {
//        uninstallHub();
//    }

    @Test
    public void sjsXml() throws IOException, ParserConfigurationException, SAXException {
        installXmlDocs("sjs-xml");

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-xml",
            FlowType.HARMONIZE);
        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);


        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount("sjs-xml"));
        Document expected = getXmlFromResource("e2e-test/final.xml");
        for (int i = 0; i < TEST_SIZE; i++) {
            Document actual = finalDocMgr.read("/input-" + i + ".xml").next().getContent(new DOMHandle()).get();
            assertXMLEqual(expected, actual);
        }

        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE, node.get("successfulEvents").asInt());
        Assert.assertEquals(0, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED", node.get("status").asText());
    }

    @Test
    public void sjsXmlErrors() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installXmlDocs("sjs-xml-errors");

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-xml-errors",
            FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .onItemComplete((String jobId, String itemId) -> {
                completed.add(itemId);
            })
            .onItemFailed((String jobId, String itemId) -> {
                failed.add(itemId);
            });

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE - 1, getFinalDocCount("sjs-xml-errors"));
        Assert.assertEquals(TEST_SIZE - 1, completed.size());
        Assert.assertEquals(1, failed.size());
        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE - 1, node.get("successfulEvents").asInt());
        Assert.assertEquals(1, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED_WITH_ERRORS", node.get("status").asText());
    }

    @Test
    public void sjsXmlFailedMain() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installXmlDocs("sjs-xml-failed-main");

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-xml-failed-main",
            FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .onItemComplete((String jobId, String itemId) -> {
                completed.add(itemId);
            })
            .onItemFailed((String jobId, String itemId) -> {
                failed.add(itemId);
            });

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(0, getFinalDocCount("sjs-xml-failed-main"));
        Assert.assertEquals(0, completed.size());
        Assert.assertEquals(TEST_SIZE, failed.size());
        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(0, node.get("successfulEvents").asInt());
        Assert.assertEquals(TEST_SIZE, node.get("failedEvents").asInt());
        Assert.assertEquals(0, node.get("successfulBatches").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("failedBatches").asInt());
        Assert.assertEquals("FAILED", node.get("status").asText());
    }

    @Test
    public void sjsXmlNoWait() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installXmlDocs("sjs-xml-no-wait");

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-xml-no-wait",
            FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        flowRunner.run();

        try {
            flowRunner.awaitCompletion(2, TimeUnit.MILLISECONDS);
        } catch(InterruptedException e) {

        }

        Assert.assertNotEquals(TEST_SIZE, getFinalDocCount("sjs-xml-no-wait"));
        flowRunner.awaitCompletion();
    }

    @Test
    public void sjsJson() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installJsonDocs("sjs-json");

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-json",
            FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount("sjs-json"));
        String expected = getResource("e2e-test/final.json");
        for (int i = 0; i < TEST_SIZE; i++) {
            String actual = finalDocMgr.read("/input-" + i + ".json").next().getContent(new StringHandle()).get();
            JSONAssert.assertEquals(expected, actual, false);
        }

        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE, node.get("successfulEvents").asInt());
        Assert.assertEquals(0, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED", node.get("status").asText());

        String optionsExpected = getResource("e2e-test/options-test.json");
        String optionsActual = finalDocMgr.read("/options-test.json").next().getContent(new StringHandle()).get();
        JSONAssert.assertEquals(optionsExpected, optionsActual, false);
    }

    @Test
    public void sjsJsonViaRestInsert() throws IOException, ParserConfigurationException, SAXException, JSONException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);

        ServerTransform serverTransform = new ServerTransform("run-flow");
        serverTransform.addParameter("job-id", UUID.randomUUID().toString());
        serverTransform.addParameter("entity", ENTITY);
        serverTransform.addParameter("flow", "sjs-json-input-flow");
        FileHandle handle = new FileHandle(getResourceFile("e2e-test/input/input.json"));
        handle.setFormat(Format.JSON);
        stagingDocMgr.write("/test.json", handle, serverTransform);

        Assert.assertEquals(1, getStagingDocCount());
        String expected = getResource("e2e-test/staged.json");

        String actual = stagingDocMgr.read("/test.json").next().getContent(new StringHandle()).get();
        JSONAssert.assertEquals(expected, actual, false);
    }

    @Test
    public void sjsJsonViaMlcp() throws IOException, ParserConfigurationException, SAXException, JSONException, InterruptedException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);

        String flowName = "sjs-json-input-flow";
        Flow flow = flowManager.getFlow(ENTITY, flowName, FlowType.INPUT);
        ObjectMapper objectMapper = new ObjectMapper();
        String inputPath = getResourceFile("e2e-test/input/input.json").getAbsolutePath();
        String basePath = getResourceFile("e2e-test/input").getAbsolutePath();
        JsonNode mlcpOptions = objectMapper.readTree(
            "{" +
                "\"input_file_path\":\"" + inputPath + "\"," +
                "\"input_file_type\":\"\\\"documents\\\"\"," +
                "\"output_collections\":\"\\\"" + ENTITY + "\\\"\"," +
                "\"output_permissions\":\"\\\"rest-reader,read,rest-writer,update\\\"\"," +
                "\"output_uri_replace\":\"\\\"" + basePath + ",''\\\"\"," +
                "\"document_type\":\"\\\"json\\\"\"," +
                "\"transform_module\":\"\\\"/com.marklogic.hub/mlcp-flow-transform.xqy\\\"\"," +
                "\"transform_namespace\":\"\\\"http://marklogic.com/data-hub/mlcp-flow-transform\\\"\"," +
                "\"transform_param\":\"\\\"entity=" + ENTITY + ",flow=" + flowName + ",flowType=input\\\"\"" +
            "}");
        FlowStatusListener flowStatusListener = (jobId, percentComplete, message) -> {
            logger.error(message);
        };
        MlcpRunner mlcpRunner = new MlcpRunner("com.marklogic.hub.util.MlcpMain", getHubConfig(), flow, mlcpOptions, flowStatusListener);
        mlcpRunner.start();
        mlcpRunner.join();

        Assert.assertEquals(1, getStagingDocCount());
        String expected = getResource("e2e-test/staged.json");

        String actual = stagingDocMgr.read("/input.json").next().getContent(new StringHandle()).get();
        JSONAssert.assertEquals(expected, actual, false);
    }

    @Test
    public void sjsXmlViaMlcp() throws IOException, ParserConfigurationException, SAXException, JSONException, InterruptedException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);

        String flowName = "sjs-xml-input-flow";
        Flow flow = flowManager.getFlow(ENTITY, flowName, FlowType.INPUT);
        ObjectMapper objectMapper = new ObjectMapper();
        String inputPath = getResourceFile("e2e-test/input/input.xml").getAbsolutePath();
        String basePath = getResourceFile("e2e-test/input").getAbsolutePath();
        JsonNode mlcpOptions = objectMapper.readTree(
            "{" +
                "\"input_file_path\":\"" + inputPath + "\"," +
                "\"input_file_type\":\"\\\"documents\\\"\"," +
                "\"output_collections\":\"\\\"" + ENTITY + "\\\"\"," +
                "\"output_permissions\":\"\\\"rest-reader,read,rest-writer,update\\\"\"," +
                "\"output_uri_replace\":\"\\\"" + basePath + ",''\\\"\"," +
                "\"document_type\":\"\\\"xml\\\"\"," +
                "\"transform_module\":\"\\\"/com.marklogic.hub/mlcp-flow-transform.xqy\\\"\"," +
                "\"transform_namespace\":\"\\\"http://marklogic.com/data-hub/mlcp-flow-transform\\\"\"," +
                "\"transform_param\":\"\\\"entity=" + ENTITY + ",flow=" + flowName + ",flowType=input\\\"\"" +
                "}");
        FlowStatusListener flowStatusListener = (jobId, percentComplete, message) -> {
            logger.error(message);
        };
        MlcpRunner mlcpRunner = new MlcpRunner("com.marklogic.hub.util.MlcpMain", getHubConfig(), flow, mlcpOptions, flowStatusListener);
        mlcpRunner.start();
        mlcpRunner.join();

        Assert.assertEquals(1, getStagingDocCount());
        Document expected = getXmlFromResource("e2e-test/staged.xml");

        Document actual = stagingDocMgr.read("/input.xml").next().getContent(new DOMHandle()).get();
        assertXMLEqual(expected, actual);
    }

    @Test
    public void xqyJsonViaMlcp() throws IOException, ParserConfigurationException, SAXException, JSONException, InterruptedException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);

        String flowName = "xqy-json-input-flow";
        Flow flow = flowManager.getFlow(ENTITY, flowName, FlowType.INPUT);
        ObjectMapper objectMapper = new ObjectMapper();
        String inputPath = getResourceFile("e2e-test/input/input.json").getAbsolutePath();
        String basePath = getResourceFile("e2e-test/input").getAbsolutePath();
        JsonNode mlcpOptions = objectMapper.readTree(
            "{" +
                "\"input_file_path\":\"" + inputPath + "\"," +
                "\"input_file_type\":\"\\\"documents\\\"\"," +
                "\"output_collections\":\"\\\"" + ENTITY + "\\\"\"," +
                "\"output_permissions\":\"\\\"rest-reader,read,rest-writer,update\\\"\"," +
                "\"output_uri_replace\":\"\\\"" + basePath + ",''\\\"\"," +
                "\"document_type\":\"\\\"json\\\"\"," +
                "\"transform_module\":\"\\\"/com.marklogic.hub/mlcp-flow-transform.xqy\\\"\"," +
                "\"transform_namespace\":\"\\\"http://marklogic.com/data-hub/mlcp-flow-transform\\\"\"," +
                "\"transform_param\":\"\\\"entity=" + ENTITY + ",flow=" + flowName + ",flowType=input\\\"\"" +
                "}");
        FlowStatusListener flowStatusListener = (jobId, percentComplete, message) -> {
            logger.error(message);
        };
        MlcpRunner mlcpRunner = new MlcpRunner("com.marklogic.hub.util.MlcpMain", getHubConfig(), flow, mlcpOptions, flowStatusListener);
        mlcpRunner.start();
        mlcpRunner.join();

        Assert.assertEquals(1, getStagingDocCount());
        String expected = getResource("e2e-test/staged.json");

        String actual = stagingDocMgr.read("/input.json").next().getContent(new StringHandle()).get();
        JSONAssert.assertEquals(expected, actual, false);
    }

    @Test
    public void xqyXmlViaMlcp() throws IOException, ParserConfigurationException, SAXException, JSONException, InterruptedException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);

        String flowName = "xqy-xml-input-flow";
        Flow flow = flowManager.getFlow(ENTITY, flowName, FlowType.INPUT);
        ObjectMapper objectMapper = new ObjectMapper();
        String inputPath = getResourceFile("e2e-test/input/input.xml").getAbsolutePath();
        String basePath = getResourceFile("e2e-test/input").getAbsolutePath();
        JsonNode mlcpOptions = objectMapper.readTree(
            "{" +
                "\"input_file_path\":\"" + inputPath + "\"," +
                "\"input_file_type\":\"\\\"documents\\\"\"," +
                "\"output_collections\":\"\\\"" + ENTITY + "\\\"\"," +
                "\"output_permissions\":\"\\\"rest-reader,read,rest-writer,update\\\"\"," +
                "\"output_uri_replace\":\"\\\"" + basePath + ",''\\\"\"," +
                "\"document_type\":\"\\\"xml\\\"\"," +
                "\"transform_module\":\"\\\"/com.marklogic.hub/mlcp-flow-transform.xqy\\\"\"," +
                "\"transform_namespace\":\"\\\"http://marklogic.com/data-hub/mlcp-flow-transform\\\"\"," +
                "\"transform_param\":\"\\\"entity=" + ENTITY + ",flow=" + flowName + ",flowType=input\\\"\"" +
                "}");
        FlowStatusListener flowStatusListener = (jobId, percentComplete, message) -> {
            logger.error(message);
        };
        MlcpRunner mlcpRunner = new MlcpRunner("com.marklogic.hub.util.MlcpMain", getHubConfig(), flow, mlcpOptions, flowStatusListener);
        mlcpRunner.start();
        mlcpRunner.join();

        Assert.assertEquals(1, getStagingDocCount());
        Document expected = getXmlFromResource("e2e-test/staged.xml");

        Document actual = stagingDocMgr.read("/input.xml").next().getContent(new DOMHandle()).get();
        assertXMLEqual(expected, actual);
    }

    @Test
    public void sjsJsonErrors() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installJsonDocs("sjs-json-errors");

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-json-errors",
            FlowType.HARMONIZE);
        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .onItemComplete((String jobId, String itemId) -> {
                completed.add(itemId);
            })
            .onItemFailed((String jobId, String itemId) -> {
                failed.add(itemId);
            });

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE - 1, getFinalDocCount("sjs-json-errors"));
        Assert.assertEquals(TEST_SIZE - 1, completed.size());
        Assert.assertEquals(1, failed.size());
        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE - 1, node.get("successfulEvents").asInt());
        Assert.assertEquals(1, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED_WITH_ERRORS", node.get("status").asText());

    }

    @Test
    public void sjsJsonFailedMain() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installJsonDocs("sjs-json-failed-main");

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-json-failed-main",
            FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .onItemComplete((String jobId, String itemId) -> {
                completed.add(itemId);
            })
            .onItemFailed((String jobId, String itemId) -> {
                failed.add(itemId);
            });

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(0, getFinalDocCount("sjs-json-failed-main"));
        Assert.assertEquals(0, completed.size());
        Assert.assertEquals(TEST_SIZE, failed.size());
        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(0, node.get("successfulEvents").asInt());
        Assert.assertEquals(TEST_SIZE, node.get("failedEvents").asInt());
        Assert.assertEquals(0, node.get("successfulBatches").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("failedBatches").asInt());
        Assert.assertEquals("FAILED", node.get("status").asText());
    }


    @Test
    public void sjsJsonNoWait() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installJsonDocs("sjs-json-no-wait");

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-json-no-wait",
            FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        flowRunner.run();

        try {
            flowRunner.awaitCompletion(2, TimeUnit.MILLISECONDS);
        } catch(InterruptedException e) {

        }

        Assert.assertNotEquals(TEST_SIZE, getFinalDocCount("sjs-json-no-wait"));
        flowRunner.awaitCompletion();
    }

    @Test
    public void xqyJson() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installJsonDocs("xqy-json");

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-json",
            FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount("xqy-json"));
        String expected = getResource("e2e-test/final.json");
        for (int i = 0; i < TEST_SIZE; i++) {
            String actual = finalDocMgr.read("/input-" + i + ".json").next().getContent(new StringHandle()).get();
            JSONAssert.assertEquals(expected, actual, false);
        }

        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE, node.get("successfulEvents").asInt());
        Assert.assertEquals(0, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED", node.get("status").asText());

        Document optionsActual = finalDocMgr.read("/options-test.xml").next().getContent(new DOMHandle()).get();
        Document optionsExpected = getXmlFromResource("e2e-test/options-test.xml");
        assertXMLEqual(optionsExpected, optionsActual);
    }

    @Test
    public void xqyJsonTriplesArray() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installJsonDocs("xqy-json-triples-array");

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-json-triples-array",
            FlowType.HARMONIZE);
        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount("xqy-json-triples-array"));
        String expected = getResource("e2e-test/final.json");
        for (int i = 0; i < TEST_SIZE; i++) {
            String actual = finalDocMgr.read("/input-" + i + ".json").next().getContent(new StringHandle()).get();
            JSONAssert.assertEquals(expected, actual, false);
        }

        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE, node.get("successfulEvents").asInt());
        Assert.assertEquals(0, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED", node.get("status").asText());
    }

    @Test
    public void xqyJsonErrors() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installJsonDocs("xqy-json-errors");

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-json-errors", FlowType.HARMONIZE);
        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .onItemComplete((String jobId, String itemId) -> {
                completed.add(itemId);
            })
            .onItemFailed((String jobId, String itemId) -> {
                failed.add(itemId);
            });

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE - 1, getFinalDocCount("xqy-json-errors"));
        Assert.assertEquals(TEST_SIZE - 1, completed.size());
        Assert.assertEquals(1, failed.size());
        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE - 1, node.get("successfulEvents").asInt());
        Assert.assertEquals(1, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED_WITH_ERRORS", node.get("status").asText());
    }

    @Test
    public void xqyXmlFailedMain() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installXmlDocs("xqy-xml-failed-main");

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-xml-failed-main",
            FlowType.HARMONIZE);

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .onItemComplete((String jobId, String itemId) -> {
                completed.add(itemId);
            })
            .onItemFailed((String jobId, String itemId) -> {
                failed.add(itemId);
            });

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(0, getFinalDocCount("xqy-xml-failed-main"));
        Assert.assertEquals(0, completed.size());
        Assert.assertEquals(TEST_SIZE, failed.size());
        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(0, node.get("successfulEvents").asInt());
        Assert.assertEquals(TEST_SIZE, node.get("failedEvents").asInt());
        Assert.assertEquals(0, node.get("successfulBatches").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("failedBatches").asInt());
        Assert.assertEquals("FAILED", node.get("status").asText());
    }

    @Test
    public void xqyJsonNoWait() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installJsonDocs("xqy-json-no-wait");

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-json-no-wait",
            FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        flowRunner.run();

        try {
            flowRunner.awaitCompletion(2, TimeUnit.MILLISECONDS);
        } catch(InterruptedException e) {

        }

        Assert.assertNotEquals(TEST_SIZE, getFinalDocCount("xqy-json-no-wait"));
        flowRunner.awaitCompletion();
    }

    @Test
    public void xqyXml() throws IOException, ParserConfigurationException, SAXException {
        installXmlDocs("xqy-xml");

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-xml",
            FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount("xqy-xml"));
        Document expected = getXmlFromResource("e2e-test/final.xml");
        for (int i = 0; i < TEST_SIZE; i++) {
            Document actual = finalDocMgr.read("/input-" + i + ".xml").next().getContent(new DOMHandle()).get();
            assertXMLEqual(expected, actual);
        }

        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE, node.get("successfulEvents").asInt());
        Assert.assertEquals(0, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED", node.get("status").asText());
    }

    @Test
    public void xqyXmlErrors() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installXmlDocs("xqy-xml-errors");

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-xml-errors",
            FlowType.HARMONIZE);

        Vector<String> completed = new Vector<>();
        Vector<String> failed = new Vector<>();

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4)
            .onItemComplete((String jobId, String itemId) -> {
                completed.add(itemId);
            })
            .onItemFailed((String jobId, String itemId) -> {
                failed.add(itemId);
            });


        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE - 1, getFinalDocCount("xqy-xml-errors"));
        Assert.assertEquals(TEST_SIZE - 1, completed.size());
        Assert.assertEquals(1, failed.size());
        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE - 1, node.get("successfulEvents").asInt());
        Assert.assertEquals(1, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED_WITH_ERRORS", node.get("status").asText());
    }

    @Test
    public void xqyXmlNoWait() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installXmlDocs("xqy-xml-no-wait");

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-xml-no-wait",
            FlowType.HARMONIZE);
        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        flowRunner.run();

        try {
            flowRunner.awaitCompletion(2, TimeUnit.MILLISECONDS);
        } catch(InterruptedException e) {

        }

        Assert.assertNotEquals(TEST_SIZE, getFinalDocCount("xqy-xml-no-wait"));
        flowRunner.awaitCompletion();
    }


    @Test
    public void scaffoldedXqyJson() throws IOException, ParserConfigurationException, SAXException, JSONException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);
        installJsonDocs(ENTITY);

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "scaffolded-xqy-json",
            FlowType.HARMONIZE);
        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount(ENTITY));
        String expected = getResource("e2e-test/scaffolded/final.json");
        for (int i = 0; i < TEST_SIZE; i++) {
            String actual = finalDocMgr.read("/input-" + i + ".json").next().getContent(new StringHandle()).get();
            JSONAssert.assertEquals(expected, actual, false);
        }

        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE, node.get("successfulEvents").asInt());
        Assert.assertEquals(0, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED", node.get("status").asText());
    }

    @Test
    public void scaffoldedXqyXml() throws IOException, ParserConfigurationException, SAXException, JSONException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);
        installXmlDocs(ENTITY);

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "scaffolded-xqy-xml",
            FlowType.HARMONIZE);
        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount(ENTITY));
        Document expected = getXmlFromResource("e2e-test/scaffolded/final.xml");
        for (int i = 0; i < TEST_SIZE; i++) {
            Document actual = finalDocMgr.read("/input-" + i + ".xml").next().getContent(new DOMHandle()).get();
            assertXMLEqual(expected, actual);
        }

        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE, node.get("successfulEvents").asInt());
        Assert.assertEquals(0, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED", node.get("status").asText());
    }

    @Test
    public void scaffoldedSjsJson() throws IOException, ParserConfigurationException, SAXException, JSONException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);
        installJsonDocs(ENTITY);

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "scaffolded-sjs-json",
            FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount(ENTITY));
        String expected = getResource("e2e-test/scaffolded/final.json");
        for (int i = 0; i < TEST_SIZE; i++) {
            String actual = finalDocMgr.read("/input-" + i + ".json").next().getContent(new StringHandle()).get();
            JSONAssert.assertEquals(expected, actual, false);
        }

        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE, node.get("successfulEvents").asInt());
        Assert.assertEquals(0, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED", node.get("status").asText());
    }


    @Test
    public void scaffoldedSjsXml() throws IOException, ParserConfigurationException, SAXException, JSONException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);
        installXmlDocs(ENTITY);

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "scaffolded-sjs-xml",
            FlowType.HARMONIZE);
        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount(ENTITY));
        Document expected = getXmlFromResource("e2e-test/scaffolded/final.xml");
        for (int i = 0; i < TEST_SIZE; i++) {
            Document actual = finalDocMgr.read("/input-" + i + ".xml").next().getContent(new DOMHandle()).get();
            assertXMLEqual(expected, actual);
        }

        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE, node.get("successfulEvents").asInt());
        Assert.assertEquals(0, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED", node.get("status").asText());
    }

    private void installJsonDocs(String collection) throws IOException {
        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4)
            .onBatchSuccess(batch -> {
                installDocsFinished = true;
            })
            .onBatchFailure((batch, failure) -> {
                failure.printStackTrace();
                installDocError = failure.getMessage();
                installDocsFailed = true;
            });

        installDocsFinished = false;
        installDocsFailed = false;
        dataMovementManager.startJob(writeBatcher);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add(collection);
        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".json", metadataHandle, handle);
        }

        writeBatcher.flushAndWait();
        assertTrue("Doc install not finished", installDocsFinished);
        assertFalse("Doc install failed: " + installDocError, installDocsFailed);
        assertEquals(TEST_SIZE, getStagingDocCount(collection));
    }

    private void installXmlDocs(String collection) throws IOException {

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4)
            .onBatchSuccess(batch -> {
                installDocsFinished = true;
            })
            .onBatchFailure((batch, failure) -> {
                failure.printStackTrace();
                installDocError = failure.getMessage();
                installDocsFailed = true;
            });

        installDocsFinished = false;
        installDocsFailed = false;
        dataMovementManager.startJob(writeBatcher);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add(collection);
        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".xml", metadataHandle, handle);
        }

        writeBatcher.flushAndWait();
        assertTrue("Doc install not finished", installDocsFinished);
        assertFalse("Doc install failed: " + installDocError, installDocsFailed);
        assertEquals(TEST_SIZE, getStagingDocCount(collection));
    }

    @Test
    public void legacySjsJson() throws IOException, ParserConfigurationException, SAXException, JSONException {
        installJsonDocs("legacy-sjs-json");

        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "legacy-sjs-json",
            FlowType.HARMONIZE);

        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(BATCH_SIZE)
            .withThreadCount(4);

        JobTicket jobExecution = flowRunner.run();

        flowRunner.awaitCompletion();

        Assert.assertEquals(TEST_SIZE, getFinalDocCount("legacy-sjs-json"));
        String expected = getResource("e2e-test/final.json");
        for (int i = 0; i < TEST_SIZE; i++) {
            String actual = finalDocMgr.read("/input-" + i + ".json").next().getContent(new StringHandle()).get();
            JSONAssert.assertEquals(expected, actual, false);
        }

        JsonNode node = jobDocMgr.read("/jobs/" + jobExecution.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(jobExecution.getJobId(), node.get("jobId").asText());
        Assert.assertEquals(TEST_SIZE, node.get("successfulEvents").asInt());
        Assert.assertEquals(0, node.get("failedEvents").asInt());
        Assert.assertEquals(TEST_SIZE / BATCH_SIZE, node.get("successfulBatches").asInt());
        Assert.assertEquals(0, node.get("failedBatches").asInt());
        Assert.assertEquals("FINISHED", node.get("status").asText());

        String optionsExpected = getResource("e2e-test/options-test.json");
        String optionsActual = finalDocMgr.read("/options-test.json").next().getContent(new StringHandle()).get();
        JSONAssert.assertEquals(optionsExpected, optionsActual, false);
    }
}
