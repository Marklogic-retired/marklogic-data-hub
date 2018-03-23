package com.marklogic.hub.collector;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertEquals;

public class StreamCollectorTest extends HubTestBase {

    private static final String ENTITY = "streamentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");
    private static final int TEST_SIZE = 3000000;
    private static final int BATCH_SIZE = 1000;
    private static int DOC_COUNT = TEST_SIZE / BATCH_SIZE;

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

        createProjectDir();

        Path dbDir = projectDir.resolve("user-config").resolve("databases");
        dbDir.toFile().mkdirs();
        FileUtil.copy(getResourceStream("stream-collector-test/staging-database.json"), dbDir.resolve("staging-database.json").toFile());

        installHub();

        // disable tracing because trying to trace the 3 million ids to a doc will fail.
        disableDebugging();
        disableTracing();

        Scaffolding scaffolding = Scaffolding.create(projectDir.toString(), stagingClient);
        scaffolding.createEntity(ENTITY);
        scaffolding.createFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML);

        DataHub dh = DataHub.create(getHubConfig());
        dh.clearUserModules();
        installUserModules(getHubConfig(), false);
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);

        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/collector.xqy", "stream-collector-test/collector.xqy");
        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/content.xqy", "stream-collector-test/content.xqy");
    }

    @Before
    public void setupFiles() {
        DataMovementManager stagingDataMovementManager = stagingClient.newDataMovementManager();
        WriteBatcher writeBatcher = stagingDataMovementManager.newWriteBatcher()
            .withBatchSize(2000)
            .withThreadCount(8)
            .onBatchSuccess(batch -> installDocsFinished = true)
            .onBatchFailure((batch, failure) -> {
                failure.printStackTrace();
                installDocError = failure.getMessage();
                installDocsFailed = true;
            });

        installDocsFinished = false;
        installDocsFailed = false;
        stagingDataMovementManager.startJob(writeBatcher);

        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        int counter = 0;
        for (int i = 0; i < DOC_COUNT; i++) {
            ArrayList<String> contents = new ArrayList<>();
            for (int j = 0; j < BATCH_SIZE; j++) {
                contents.add("\"id\":\"" + counter + "\"");
                counter++;
            }
            StringHandle handle = new StringHandle("{" + String.join(",", contents) + "}").withFormat(Format.JSON);
            writeBatcher.add("/doc-" + i + ".json", metadataHandle, handle);
        }

        writeBatcher.flushAndWait();
        assertTrue("Doc install not finished", installDocsFinished );
        assertFalse("Doc install failed: " + installDocError, installDocsFailed);
    }

    @AfterClass
    public static void teardown() {
        uninstallHub();
        deleteProjectDir();
    }

    @Test
    public void runCollector() {
        // this test relies on a flow that returns DOC_COUNT items from the collector.
        // there is a custom content plugin that throws an error. This code uses the stopOnFailure
        // option to halt execution. This allows us to test that the collector runs to completion while not
        // having to wait for the entire harmonize flow to finish.
        assertEquals(DOC_COUNT, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        FlowManager fm = FlowManager.create(getHubConfig());
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);
        HashMap<String, Object> options = new HashMap<>();

        // a sneaky attempt to test passing options. this value makes the collector work.
        options.put("returnStuff", true);
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(10)
            .withThreadCount(1)
            .withOptions(options)
            .withStopOnFailure(true);
        JobTicket ticket = flowRunner.run();
        flowRunner.awaitCompletion();
        assertEquals(0, getFinalDocCount());

        JsonNode node = jobDocMgr.read("/jobs/" + ticket.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        assertEquals(ticket.getJobId(), node.get("jobId").asText());
        assertEquals(0, node.get("successfulEvents").asInt());
        assertEquals(10, node.get("failedEvents").asInt());
        assertEquals(1, node.get("failedBatches").asInt());
        assertEquals("STOP_ON_ERROR", node.get("status").asText());

    }
}
