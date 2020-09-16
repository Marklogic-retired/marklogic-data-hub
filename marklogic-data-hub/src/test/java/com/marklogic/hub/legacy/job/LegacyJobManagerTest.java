/*
 * Copyright (c) 2020 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.legacy.job;

import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.legacy.flow.*;
import com.marklogic.hub.legacy.impl.LegacyFlowManagerImpl;
import com.marklogic.hub.scaffold.Scaffolding;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.zip.ZipFile;

import static org.junit.jupiter.api.Assertions.*;

public class LegacyJobManagerTest extends AbstractHubCoreTest {

    private static final String ENTITY = "e2eentity";
    private static final String HARMONIZE_FLOW_XML = "testharmonize-xml";
    private static final String HARMONIZE_FLOW_JSON = "testharmonize-json";
    private List<String> jobIds = Collections.synchronizedList(new ArrayList<String>());

    @Autowired
    Scaffolding scaffolding;

    @Autowired
    LegacyFlowManagerImpl legacyFlowManager;

    private LegacyJobManager jobManager;

    private LegacyFlowItemCompleteListener flowItemCompleteListener =
        (jobId, itemId) -> recordJobId(jobId);

    @BeforeEach
    public void setupStuff() {
        runAsFlowDeveloper();
        enableDebugging();
        enableTracing();

        scaffolding.createEntity(ENTITY);
        // Traces can be XML or JSON, depending on the DataFormat of the flow that created them. Get some of each
        // to make sure export and import work correctly.
        scaffolding.createLegacyFlow(ENTITY, HARMONIZE_FLOW_XML, FlowType.HARMONIZE, CodeFormat.XQUERY, DataFormat.XML, false);
        scaffolding.createLegacyFlow(ENTITY, HARMONIZE_FLOW_JSON, FlowType.HARMONIZE, CodeFormat.JAVASCRIPT, DataFormat.JSON, false);

        clearUserModules();
        installUserModules(runAsFlowDeveloper(), false);

        installModule("/entities/" + ENTITY + "/harmonize/" + HARMONIZE_FLOW_XML + "/collector.xqy", "flow-runner-test/collector.xqy");
        installModule("/entities/" + ENTITY + "/harmonize/" + HARMONIZE_FLOW_XML + "/content.xqy", "flow-runner-test/content-for-options.xqy");

        installModule("/entities/" + ENTITY + "/harmonize/" + HARMONIZE_FLOW_JSON + "/collector.sjs", "flow-runner-test/collector.sjs");

        // Run a flow a couple times to generate some job/trace data.
        jobIds.clear();
        LegacyFlow harmonizeFlow = legacyFlowManager.getFlow(ENTITY, HARMONIZE_FLOW_XML, FlowType.HARMONIZE);
        HashMap<String, Object> options = new HashMap<>();
        options.put("name", "Bob Smith");
        options.put("age", 55);
        runAsFlowOperator();
        LegacyFlowRunner flowRunner = legacyFlowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(10)
            .withThreadCount(1)
            .withOptions(options)
            .onItemComplete(flowItemCompleteListener);

        flowRunner.run();
        flowRunner.run();
        flowRunner.run();
        flowRunner.awaitCompletion();

        harmonizeFlow = legacyFlowManager.getFlow(ENTITY, HARMONIZE_FLOW_JSON, FlowType.HARMONIZE);
        flowRunner = legacyFlowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(10)
            .withThreadCount(1)
            .withOptions(options)
            .onItemComplete(flowItemCompleteListener);
        flowRunner.run();
        flowRunner.awaitCompletion();
        jobManager = LegacyJobManager.create(getHubClient().getJobsClient());
    }

    @AfterEach
    public void cleanup() {
    	disableTracing();
    }

    private void recordJobId(String jobId) {
        jobIds.add(jobId);
    }

    @Test
    public void deleteOneJob() {
        assertEquals(4, getJobDocCount());
        assertEquals(8, getTracingDocCount());
        String jobs = jobIds.get(1);

        JobDeleteResponse actual = jobManager.deleteJobs(jobs);

        assertEquals(3, getJobDocCount());
        assertEquals(6, getTracingDocCount());
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
        assertEquals(4, getJobDocCount());
        assertEquals(8, getTracingDocCount());
        String jobs = jobIds.get(0) + "," + jobIds.get(2);

        JobDeleteResponse actual = jobManager.deleteJobs(jobs);

        assertEquals(2, getJobDocCount());
        assertEquals(4, getTracingDocCount());
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
        JobDeleteResponse actual = jobManager.deleteJobs("InvalidId");

        assertEquals(4, getJobDocCount());
        assertEquals(8, getTracingDocCount());
        assertEquals(0, actual.totalCount);
        assertEquals(1, actual.errorCount);
    }

    @Test
    public void deleteEmptyStringJob() {
        JobDeleteResponse actual = jobManager.deleteJobs("");

        assertEquals(4, getJobDocCount());
        assertEquals(8, getTracingDocCount());
        assertEquals(0, actual.totalCount);
        assertEquals(0, actual.errorCount);
    }

    @Test
    public void deleteNullJob() {
        JobDeleteResponse actual = jobManager.deleteJobs(null);

        assertEquals(4, getJobDocCount());
        assertEquals(8, getTracingDocCount());
        assertEquals(0, actual.totalCount);
        assertEquals(0, actual.errorCount);
    }

    @Test
    public void exportOneJob() throws IOException {
        Path exportPath = getHubProject().getProjectDir().resolve("exportOneJob.zip");
        File zipFile = exportPath.toFile();
        assertFalse(zipFile.exists());

        String[] jobs = { jobIds.get(0) };
        jobManager.exportJobs(exportPath, jobs);

        assertTrue(zipFile.exists());

        ZipFile actual = new ZipFile(zipFile);
        // There should be one job and two trace documents
        int actualSize = actual.size();
        actual.close();
        assertEquals(3, actualSize);
    }

    @Test
    public void exportMultipleJobs() throws IOException {
        Path exportPath = getHubProject().getProjectDir().resolve("exportMultipleJobs.zip");
        File zipFile = exportPath.toFile();
        assertFalse(zipFile.exists());

        String[] jobs = { jobIds.get(0), jobIds.get(1) };
        jobManager.exportJobs(exportPath, jobs);

        assertTrue(zipFile.exists());
        ZipFile actual = new ZipFile(zipFile);
        // There should be two job and four trace documents
        int actualSize = actual.size();
        actual.close();
        assertEquals(6, actualSize);
    }

    @Test
    public void exportAllJobs() throws IOException {
        Path exportPath = getHubProject().getProjectDir().resolve("exportAllJobs.zip");
        File zipFile = exportPath.toFile();
        assertFalse(zipFile.exists());

        // Some logging for debugging this test when it intermittently fails
        logger.info("Job database document count: " +
            getHubConfig().newJobDbClient().newServerEval().xquery("fn:count(cts:uris((), (), cts:true-query()))").evalAs(String.class));
        logger.info("Job database URIs: " +
            getHubConfig().newJobDbClient().newServerEval().xquery("<uris>{cts:uris((), (), cts:true-query()) ! element uri {.}}</uris>").evalAs(String.class));
        logger.info("Will export to: " + exportPath);

        jobManager.exportJobs(exportPath, null);
        assertTrue(zipFile.exists());

        ZipFile actual = new ZipFile(zipFile);
        int actualSize = actual.size();
        assertTrue(actualSize >= 12, "The zip should have at least the expected 8 trace and 4 job documents, but " +
                "sometimes there are somehow more than 12 when running tests in parallel. It's not known what causes " +
                "this, but for the purpose of this test, we want to make sure that at least the 12 docs we know should " +
                "exist are in the zip file.");
        actual.close();
    }

    @Test
    public void exportNoJobs() {
        Path exportPath = getHubProject().getProjectDir().resolve("exportNoJobs.zip");
        resetDatabases();
        runAsFlowOperator();

        // if the jobs database is empty, do not produce a zip file.
        File zipFile = exportPath.toFile();
        assertFalse(zipFile.exists());

        jobManager.exportJobs(exportPath, null);

        assertFalse(zipFile.exists());
    }

    @Test
    public void importJobs() throws URISyntaxException, IOException {
        URL url = LegacyJobManagerTest.class.getClassLoader().getResource("job-manager-test/jobexport.zip");

        resetDatabases();
        runAsFlowDeveloper();

        assertEquals(0, getJobDocCount());
        assertEquals(0, getTracingDocCount());

        jobManager.importJobs(Paths.get(url.toURI()));

        assertEquals(4, getJobDocCount());
        assertEquals(8, getTracingDocCount());

        // Check one of the (known) JSON trace documents to make sure it was loaded as JSON
        EvalResultIterator evalResults = runInDatabase("xdmp:type(fn:doc('/5177365055356498236.json'))", HubConfig.DEFAULT_JOB_NAME);
        if (evalResults.hasNext()) {
            String type = evalResults.next().getString();
            assertEquals("object", type);
        }
        else {
            fail("Trace document was not loaded as JSON");
        }

        // Check one of the (known) XML trace documents to make sure it was loaded as XML
        evalResults = runInDatabase("xdmp:type(fn:doc('/1311179527065924494.xml'))", HubConfig.DEFAULT_JOB_NAME);
        if (evalResults.hasNext()) {
            String type = evalResults.next().getString();
            assertEquals("untypedAtomic", type);
        }
        else {
            fail("Trace document was not loaded as XML");
        }
    }
}
