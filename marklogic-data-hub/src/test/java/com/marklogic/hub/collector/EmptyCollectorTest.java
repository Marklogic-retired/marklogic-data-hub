package com.marklogic.hub.collector;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.scaffold.Scaffolding;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;

import static org.junit.Assert.assertEquals;

public class EmptyCollectorTest extends HubTestBase {

    private static final String ENTITY = "streamentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);
        File projectDirFile = projectDir.toFile();
        if (projectDirFile.isDirectory() && projectDirFile.exists()) {
            FileUtils.deleteDirectory(projectDirFile);
        }

        createProjectDir();

        installHub();

        Scaffolding scaffolding = Scaffolding.create(projectDir.toString(), stagingClient);
        scaffolding.createEntity(ENTITY);
        scaffolding.createFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML);

        DataHub dh = DataHub.create(getHubConfig());
        dh.clearUserModules();
        installUserModules(getHubConfig(), false);
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);
    }


    @AfterClass
    public static void teardown() {
        uninstallHub();
    }

    @Test
    public void runCollector() {
        assertEquals(0, getStagingDocCount());
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
        assertEquals(0, node.get("failedEvents").asInt());
        assertEquals(0, node.get("failedBatches").asInt());
        assertEquals("FAILED", node.get("status").asText());

    }
}
