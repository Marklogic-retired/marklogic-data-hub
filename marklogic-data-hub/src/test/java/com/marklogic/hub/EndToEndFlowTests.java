package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.io.*;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.plugin.PluginFormat;
import com.marklogic.hub.scaffold.Scaffolding;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.json.JSONException;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.skyscreamer.jsonassert.JSONAssert;
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

public class EndToEndFlowTests extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");
    private static final int TEST_SIZE = 1000;
    private static final int BATCH_SIZE = 10;
    private static FlowManager flowManager;
    private static DataMovementManager dataMovementManager;

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

        scaffolding.createFlow(ENTITY, "sjs-json", FlowType.HARMONIZE,
            PluginFormat.JAVASCRIPT, Format.JSON);

        scaffolding.createFlow(ENTITY, "sjs-json-no-wait", FlowType.HARMONIZE,
            PluginFormat.JAVASCRIPT, Format.JSON);

        scaffolding.createFlow(ENTITY, "sjs-json-errors", FlowType.HARMONIZE,
            PluginFormat.JAVASCRIPT, Format.JSON);

        scaffolding.createFlow(ENTITY, "sjs-xml", FlowType.HARMONIZE,
            PluginFormat.JAVASCRIPT, Format.XML);

        scaffolding.createFlow(ENTITY, "sjs-xml-no-wait", FlowType.HARMONIZE,
            PluginFormat.JAVASCRIPT, Format.XML);

        scaffolding.createFlow(ENTITY, "sjs-xml-errors", FlowType.HARMONIZE,
            PluginFormat.JAVASCRIPT, Format.XML);

        scaffolding.createFlow(ENTITY, "xqy-json", FlowType.HARMONIZE,
            PluginFormat.XQUERY, Format.JSON);

        scaffolding.createFlow(ENTITY, "xqy-json-no-wait", FlowType.HARMONIZE,
            PluginFormat.XQUERY, Format.JSON);

        scaffolding.createFlow(ENTITY, "xqy-json-errors", FlowType.HARMONIZE,
            PluginFormat.XQUERY, Format.JSON);

        scaffolding.createFlow(ENTITY, "xqy-json-triples-array", FlowType.HARMONIZE,
            PluginFormat.XQUERY, Format.JSON);

        scaffolding.createFlow(ENTITY, "xqy-xml", FlowType.HARMONIZE,
            PluginFormat.XQUERY, Format.XML);

        scaffolding.createFlow(ENTITY, "xqy-xml-no-wait", FlowType.HARMONIZE,
            PluginFormat.XQUERY, Format.XML);

        scaffolding.createFlow(ENTITY, "xqy-xml-errors", FlowType.HARMONIZE,
            PluginFormat.XQUERY, Format.XML);

        Path harmonizeDir = projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize");
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector/collector.sjs"), harmonizeDir.resolve("sjs-json/collector/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers/headers.sjs"), harmonizeDir.resolve("sjs-json/headers/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content/content.sjs"), harmonizeDir.resolve("sjs-json/content/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples/triples.sjs"), harmonizeDir.resolve("sjs-json/triples/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writers/writer.sjs"), harmonizeDir.resolve("sjs-json/writer/writer.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector/collector.sjs"), harmonizeDir.resolve("sjs-json-no-wait/collector/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers/headers.sjs"), harmonizeDir.resolve("sjs-json-no-wait/headers/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content/content.sjs"), harmonizeDir.resolve("sjs-json-no-wait/content/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples/triples.sjs"), harmonizeDir.resolve("sjs-json-no-wait/triples/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writers/writer.sjs"), harmonizeDir.resolve("sjs-json-no-wait/writer/writer.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector/collector.sjs"), harmonizeDir.resolve("sjs-json-errors/collector/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers/headers-with-error.sjs"), harmonizeDir.resolve("sjs-json-errors/headers/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content/content.sjs"), harmonizeDir.resolve("sjs-json-errors/content/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples/triples.sjs"), harmonizeDir.resolve("sjs-json-errors/triples/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writers/writer.sjs"), harmonizeDir.resolve("sjs-json-errors/writer/writer.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector/collector.sjs"), harmonizeDir.resolve("sjs-xml/collector/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers/headers.sjs"), harmonizeDir.resolve("sjs-xml/headers/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content/content.sjs"), harmonizeDir.resolve("sjs-xml/content/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples/triples.sjs"), harmonizeDir.resolve("sjs-xml/triples/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writers/writer.sjs"), harmonizeDir.resolve("sjs-xml/writer/writer.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector/collector.sjs"), harmonizeDir.resolve("sjs-xml-no-wait/collector/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers/headers.sjs"), harmonizeDir.resolve("sjs-xml-no-wait/headers/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content/content.sjs"), harmonizeDir.resolve("sjs-xml-no-wait/content/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples/triples.sjs"), harmonizeDir.resolve("sjs-xml-no-wait/triples/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writers/writer.sjs"), harmonizeDir.resolve("sjs-xml-no-wait/writer/writer.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/collector/collector.sjs"), harmonizeDir.resolve("sjs-xml-errors/collector/collector.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/headers/headers-with-error.sjs"), harmonizeDir.resolve("sjs-xml-errors/headers/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/content/content.sjs"), harmonizeDir.resolve("sjs-xml-errors/content/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/triples/triples.sjs"), harmonizeDir.resolve("sjs-xml-errors/triples/triples.sjs").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/sjs-flow/writers/writer.sjs"), harmonizeDir.resolve("sjs-xml-errors/writer/writer.sjs").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector/collector.xqy"), harmonizeDir.resolve("xqy-json/collector/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers/headers-json.xqy"), harmonizeDir.resolve("xqy-json/headers/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content/content.xqy"), harmonizeDir.resolve("xqy-json/content/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples/triples.xqy"), harmonizeDir.resolve("xqy-json/triples/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writers/writer.xqy"), harmonizeDir.resolve("xqy-json/writer/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector/collector.xqy"), harmonizeDir.resolve("xqy-json-no-wait/collector/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers/headers-json.xqy"), harmonizeDir.resolve("xqy-json-no-wait/headers/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content/content.xqy"), harmonizeDir.resolve("xqy-json-no-wait/content/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples/triples.xqy"), harmonizeDir.resolve("xqy-json-no-wait/triples/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writers/writer.xqy"), harmonizeDir.resolve("xqy-json-no-wait/writer/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector/collector.xqy"), harmonizeDir.resolve("xqy-json-errors/collector/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers/headers-json-with-error.xqy"), harmonizeDir.resolve("xqy-json-errors/headers/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content/content.xqy"), harmonizeDir.resolve("xqy-json-errors/content/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples/triples.xqy"), harmonizeDir.resolve("xqy-json-errors/triples/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writers/writer.xqy"), harmonizeDir.resolve("xqy-json-errors/writer/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector/collector.xqy"), harmonizeDir.resolve("xqy-json-triples-array/collector/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers/headers-json.xqy"), harmonizeDir.resolve("xqy-json-triples-array/headers/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content/content.xqy"), harmonizeDir.resolve("xqy-json-triples-array/content/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples/triples-json-array.xqy"), harmonizeDir.resolve("xqy-json-triples-array/triples/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writers/writer.xqy"), harmonizeDir.resolve("xqy-json-triples-array/writer/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector/collector.xqy"), harmonizeDir.resolve("xqy-xml/collector/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers/headers-xml.xqy"), harmonizeDir.resolve("xqy-xml/headers/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content/content.xqy"), harmonizeDir.resolve("xqy-xml/content/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples/triples.xqy"), harmonizeDir.resolve("xqy-xml/triples/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writers/writer.xqy"), harmonizeDir.resolve("xqy-xml/writer/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector/collector.xqy"), harmonizeDir.resolve("xqy-xml-no-wait/collector/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers/headers-xml.xqy"), harmonizeDir.resolve("xqy-xml-no-wait/headers/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content/content.xqy"), harmonizeDir.resolve("xqy-xml-no-wait/content/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples/triples.xqy"), harmonizeDir.resolve("xqy-xml-no-wait/triples/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writers/writer.xqy"), harmonizeDir.resolve("xqy-xml-no-wait/writer/writer.xqy").toFile());

        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/collector/collector.xqy"), harmonizeDir.resolve("xqy-xml-errors/collector/collector.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/headers/headers-json-with-error.xqy"), harmonizeDir.resolve("xqy-xml-errors/headers/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/content/content.xqy"), harmonizeDir.resolve("xqy-xml-errors/content/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/triples/triples.xqy"), harmonizeDir.resolve("xqy-xml-errors/triples/triples.xqy").toFile());
        FileUtils.copyFile(getResourceFile("e2e-test/xqy-flow/writers/writer.xqy"), harmonizeDir.resolve("xqy-xml-errors/writer/writer.xqy").toFile());

        getDataHub().installUserModules();

        flowManager = new FlowManager(getHubConfig());
        dataMovementManager = stagingClient.newDataMovementManager();
    }

    @AfterClass
    public static void teardown() throws IOException {
        uninstallHub();
    }

    @Test
    public void sjsXml() throws IOException, ParserConfigurationException, SAXException {
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-xml",
            FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("sjs-xml");
        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".xml", metadataHandle, handle);
        }
        dataMovementManager.startJob(writeBatcher);
        writeBatcher.awaitCompletion();

        flowRunner
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
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-xml-errors",
            FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("sjs-xml-errors");
        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".xml", metadataHandle, handle);
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
    public void sjsXmlNoWait() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-xml-no-wait",
            FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("sjs-xml-no-wait");
        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".xml", metadataHandle, handle);
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

        Assert.assertNotEquals(TEST_SIZE, getFinalDocCount("sjs-xml-no-wait"));
    }

    @Test
    public void sjsJson() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-json",
            FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);


        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("sjs-json");
        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".json", metadataHandle, handle);
        }
        dataMovementManager.startJob(writeBatcher);
        writeBatcher.awaitCompletion();

        flowRunner
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
    public void sjsJsonErrors() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-json-errors",
            FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("sjs-json-errors");
        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".json", metadataHandle, handle);
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
    public void sjsJsonNoWait() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "sjs-json-no-wait",
            FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("sjs-json-no-wait");
        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".json", metadataHandle, handle);
        }
        dataMovementManager.startJob(writeBatcher);
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

        Assert.assertNotEquals(TEST_SIZE, getFinalDocCount("sjs-json-no-wait"));
    }

    @Test
    public void xqyJson() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-json",
            FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("xqy-json");
        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".json", metadataHandle, handle);
        }
        dataMovementManager.startJob(writeBatcher);
        writeBatcher.flushAndWait();
        writeBatcher.awaitCompletion();

        flowRunner
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
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-json-triples-array",
            FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("xqy-json-triples-array");
        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".json", metadataHandle, handle);
        }
        dataMovementManager.startJob(writeBatcher);
        writeBatcher.flushAndWait();
        writeBatcher.awaitCompletion();

        flowRunner
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
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-json-errors", FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("xqy-json-errors");
        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".json", metadataHandle, handle);
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
    public void xqyJsonNoWait() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-json-no-wait",
            FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("xqy-json-no-wait");
        JacksonHandle handle = new JacksonHandle(getJsonFromResource("e2e-test/staged.json"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".json", metadataHandle, handle);
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

        Assert.assertNotEquals(TEST_SIZE, getFinalDocCount("xqy-json-no-wait"));
    }

    @Test
    public void xqyXml() throws IOException, ParserConfigurationException, SAXException {
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-xml",
            FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("xqy-xml");
        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".xml", metadataHandle, handle);
        }
        dataMovementManager.startJob(writeBatcher);
        writeBatcher.awaitCompletion();

        flowRunner
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
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-xml-errors",
            FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("xqy-xml-errors");
        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".xml", metadataHandle, handle);
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
        FlowRunner flowRunner = flowManager.newFlowRunner();
        Flow harmonizeFlow = flowManager.getFlow(ENTITY, "xqy-xml-no-wait",
            FlowType.HARMONIZE);

        WriteBatcher writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(100)
            .withThreadCount(4);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        metadataHandle.getCollections().add("xqy-xml-no-wait");
        StringHandle handle = new StringHandle(getResource("e2e-test/staged.xml"));
        for (int i = 0; i < TEST_SIZE; i++) {
            writeBatcher.add("/input-" + i + ".xml", metadataHandle, handle);
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

        Assert.assertNotEquals(TEST_SIZE, getFinalDocCount("xqy-xml-no-wait"));
    }
}
