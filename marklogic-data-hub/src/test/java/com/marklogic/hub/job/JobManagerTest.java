package com.marklogic.hub.job;

import com.marklogic.hub.DataHub;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.scaffold.Scaffolding;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.StringJoiner;
import java.util.zip.ZipFile;

import static org.junit.jupiter.api.Assertions.*;

public class JobManagerTest extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static ArrayList<String> jobIds = new ArrayList<String>();
    private static Path projectDir = Paths.get(".", "ye-olde-project");

    @BeforeClass
    public static void setupSuite() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);
        deleteProjectDir();

        installHub();
        enableDebugging();
        enableTracing();

        Scaffolding scaffolding = new Scaffolding(projectDir.toString(), stagingClient);
        scaffolding.createEntity(ENTITY);
        scaffolding.createFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML);

        DataHub dh = getDataHub();
        dh.clearUserModules();
        installUserModules(getHubConfig(), false);

        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/collector.xqy", "flow-runner-test/collector.xqy");
        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/content.xqy", "flow-runner-test/content-for-options.xqy");

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME,
            HubConfig.DEFAULT_TRACE_NAME);

    }

    @AfterClass
    public static void teardownSuite() throws IOException {
        uninstallHub();

        deleteProjectDir();
    }

    @Before
    public void setup() {
        // Run a flow a couple times to generate some job/trace data.
        jobIds.clear();
        FlowManager fm = new FlowManager(getHubConfig());
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);
        HashMap<String, Object> options = new HashMap<>();
        options.put("name", "Bob Smith");
        options.put("age", 55);
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(10)
            .withThreadCount(1)
            .withOptions(options)
            .onItemComplete(new FlowItemCompleteListener() {
                @Override
                public void processCompletion(String jobId, String itemId) {
                    recordJobId(jobId);
                }
            });

        flowRunner.run();
        flowRunner.run();
        flowRunner.run();
        flowRunner.awaitCompletion();

    }

    @After
    public void teardown() {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME,
            HubConfig.DEFAULT_TRACE_NAME);
    }

    private static synchronized void recordJobId(String jobId) {
        jobIds.add(jobId);
    }

    @Test
    public void deleteOneJob() {
        assertEquals(3, getJobDocCount());
        assertEquals(6, getTracingDocCount());
        JobManager manager = new JobManager(jobClient, traceClient);
        String jobs = jobIds.get(1);

        JobDeleteResponse actual = manager.deleteJobs(jobs);

        assertEquals(2, getJobDocCount());
        assertEquals(4, getTracingDocCount());
        assertEquals(1, actual.totalCount);
        assertEquals(0, actual.errorCount);

        List<String> deleteJobsExpected = new ArrayList<String>();
        deleteJobsExpected.add(jobIds.get(1));
        assertEquals(deleteJobsExpected.size(), actual.deletedJobs.size());
        assertTrue(deleteJobsExpected.containsAll(actual.deletedJobs));

        assertEquals(2, actual.deletedTraces.size());
    }

    @Test
    public void deleteMultipleJobs() {
        assertEquals(3, jobIds.size());
        assertEquals(3, getJobDocCount());
        assertEquals(6, getTracingDocCount());
        String jobs = jobIds.get(0) + "," + jobIds.get(2);
        JobManager manager = new JobManager(jobClient, traceClient);

        JobDeleteResponse actual = manager.deleteJobs(jobs);

        assertEquals(1, getJobDocCount());
        assertEquals(2, getTracingDocCount());
        assertEquals(2, actual.totalCount);
        assertEquals(0, actual.errorCount);

        List<String> deleteJobsExpected = new ArrayList<String>();
        deleteJobsExpected.add(jobIds.get(0));
        deleteJobsExpected.add(jobIds.get(2));
        assertEquals(deleteJobsExpected.size(), actual.deletedJobs.size());
        assertTrue(deleteJobsExpected.containsAll(actual.deletedJobs));

        assertEquals(4, actual.deletedTraces.size());
    }

    @Test
    public void deleteInvalidJob() {
        JobManager manager = new JobManager(jobClient, traceClient);

        JobDeleteResponse actual = manager.deleteJobs("InvalidId");

        assertEquals(3, getJobDocCount());
        assertEquals(6, getTracingDocCount());
        assertEquals(0, actual.totalCount);
        assertEquals(1, actual.errorCount);
    }

    @Test
    public void deleteEmptyStringJob() {
        JobManager manager = new JobManager(jobClient, traceClient);

        JobDeleteResponse actual = manager.deleteJobs("");

        assertEquals(3, getJobDocCount());
        assertEquals(6, getTracingDocCount());
        assertEquals(0, actual.totalCount);
        assertEquals(0, actual.errorCount);
    }

    @Test
    public void deleteNullJob() {
        JobManager manager = new JobManager(jobClient, traceClient);

        JobDeleteResponse actual = manager.deleteJobs(null);

        assertEquals(3, getJobDocCount());
        assertEquals(6, getTracingDocCount());
        assertEquals(0, actual.totalCount);
        assertEquals(0, actual.errorCount);
    }

    @Test
    public void exportOneJob() throws IOException {
        final String EXPORT_FILENAME = "testExport.zip";
        Path exportPath = projectDir.resolve(EXPORT_FILENAME);
        JobManager manager = new JobManager(jobClient, traceClient);

        File zipFile = exportPath.toFile();
        assertFalse(zipFile.exists());

        manager.exportJobs(exportPath, jobIds.get(0));

        assertTrue(zipFile.exists());

        ZipFile actual = new ZipFile(zipFile);
        // There should be one job and two trace documents
        assertEquals(3, actual.size());

        actual.close();

        Files.delete(exportPath);
    }

    @Test
    public void exportMultipleJobs() throws IOException {
        final String EXPORT_FILENAME = "testExport.zip";
        Path exportPath = projectDir.resolve(EXPORT_FILENAME);
        JobManager manager = new JobManager(jobClient, traceClient);

        File zipFile = exportPath.toFile();
        assertFalse(zipFile.exists());

        manager.exportJobs(exportPath, new StringJoiner(",").add(jobIds.get(0)).add(jobIds.get(1)).toString());

        assertTrue(zipFile.exists());

        ZipFile actual = new ZipFile(zipFile);
        // There should be two job and four trace documents
        assertEquals(6, actual.size());

        actual.close();

        Files.delete(exportPath);
    }

    @Test
    public void exportAllJobs() throws IOException {
        final String EXPORT_FILENAME = "testExport.zip";
        Path exportPath = projectDir.resolve(EXPORT_FILENAME);
        JobManager manager = new JobManager(jobClient, traceClient);

        File zipFile = exportPath.toFile();
        assertFalse(zipFile.exists());

        manager.exportJobs(exportPath, null);

        assertTrue(zipFile.exists());

        ZipFile actual = new ZipFile(zipFile);
        // There should be three job and six trace documents
        assertEquals(9, actual.size());

        actual.close();

        Files.delete(exportPath);
    }

}
