/*
 * Copyright 2012-2018 MarkLogic Corporation
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
package com.marklogic.hub.job;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.Tracing;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.mgmt.ManageClient;

import org.custommonkey.xmlunit.XMLUnit;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.zip.ZipFile;

import static org.junit.Assert.*;


public class JobManagerTest extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static final String HARMONIZE_FLOW_XML = "testharmonize-xml";
    private static final String HARMONIZE_FLOW_JSON = "testharmonize-json";
    private static List<String> jobIds = Collections.synchronizedList(new ArrayList<String>());
    private static Path projectDir = Paths.get(".", "ye-olde-project");
    private static Path exportPath = projectDir.resolve("testExport.zip");
    
    private FlowItemCompleteListener flowItemCompleteListener =
        (jobId, itemId) -> recordJobId(jobId);

    @Before
    public void setupStuff() throws InterruptedException, IOException {
        XMLUnit.setIgnoreWhitespace(true);
        deleteProjectDir();

        createProjectDir();

        enableDebugging();
        enableTracing();

        Scaffolding scaffolding = Scaffolding.create(projectDir.toString(), stagingClient);
        scaffolding.createEntity(ENTITY);
        // Traces can be XML or JSON, depending on the DataFormat of the flow that created them. Get some of each
        // to make sure export and import work correctly.
        scaffolding.createFlow(ENTITY, HARMONIZE_FLOW_XML, FlowType.HARMONIZE, CodeFormat.XQUERY, DataFormat.XML);
        scaffolding.createFlow(ENTITY, HARMONIZE_FLOW_JSON, FlowType.HARMONIZE, CodeFormat.JAVASCRIPT, DataFormat.JSON);

        DataHub dh = getDataHub();
        dh.clearUserModules();
        installUserModules(getHubConfig(), false);

        installModule("/entities/" + ENTITY + "/harmonize/" + HARMONIZE_FLOW_XML + "/collector.xqy", "flow-runner-test/collector.xqy");
        installModule("/entities/" + ENTITY + "/harmonize/" + HARMONIZE_FLOW_XML + "/content.xqy", "flow-runner-test/content-for-options.xqy");

        installModule("/entities/" + ENTITY + "/harmonize/" + HARMONIZE_FLOW_JSON + "/collector.sjs", "flow-runner-test/collector.sjs");

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME,
            HubConfig.DEFAULT_TRACE_NAME);



        // Run a flow a couple times to generate some job/trace data.
        jobIds.clear();
        FlowManager fm = FlowManager.create(getHubConfig());
        Flow harmonizeFlow = fm.getFlow(ENTITY, HARMONIZE_FLOW_XML, FlowType.HARMONIZE);
        HashMap<String, Object> options = new HashMap<>();
        options.put("name", "Bob Smith");
        options.put("age", 55);
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(10)
            .withThreadCount(1)
            .withOptions(options)
            .onItemComplete(flowItemCompleteListener);

        flowRunner.run();
        flowRunner.run();
        flowRunner.run();
        flowRunner.awaitCompletion();

        harmonizeFlow = fm.getFlow(ENTITY, HARMONIZE_FLOW_JSON, FlowType.HARMONIZE);
        flowRunner = fm.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(10)
            .withThreadCount(1)
            .withOptions(options)
            .onItemComplete(flowItemCompleteListener);
        flowRunner.run();
        flowRunner.awaitCompletion();
    }

    @After
    public void cleanup() {
    	try {
			Files.deleteIfExists(exportPath);
		} catch (IOException e) {
			e.printStackTrace();
		}
    	disableTracing();
    }
    private static void recordJobId(String jobId) {
        jobIds.add(jobId);
    }

    @Test
    public void deleteOneJob() {
        assertEquals(4, getJobDocCount());
        assertEquals(8, getTracingDocCount());
        JobManager manager = JobManager.create(jobClient, traceClient);
        String jobs = jobIds.get(1);

        JobDeleteResponse actual = manager.deleteJobs(jobs);

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
        JobManager manager = JobManager.create(jobClient, traceClient);

        JobDeleteResponse actual = manager.deleteJobs(jobs);

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
        JobManager manager = JobManager.create(jobClient, traceClient);

        JobDeleteResponse actual = manager.deleteJobs("InvalidId");

        assertEquals(4, getJobDocCount());
        assertEquals(8, getTracingDocCount());
        assertEquals(0, actual.totalCount);
        assertEquals(1, actual.errorCount);
    }

    @Test
    public void deleteEmptyStringJob() {
        JobManager manager = JobManager.create(jobClient, traceClient);

        JobDeleteResponse actual = manager.deleteJobs("");

        assertEquals(4, getJobDocCount());
        assertEquals(8, getTracingDocCount());
        assertEquals(0, actual.totalCount);
        assertEquals(0, actual.errorCount);
    }

    @Test
    public void deleteNullJob() {
        JobManager manager = JobManager.create(jobClient, traceClient);

        JobDeleteResponse actual = manager.deleteJobs(null);

        assertEquals(4, getJobDocCount());
        assertEquals(8, getTracingDocCount());
        assertEquals(0, actual.totalCount);
        assertEquals(0, actual.errorCount);
    }

    @Test
    public void exportOneJob() throws IOException {
        JobManager manager = JobManager.create(jobClient, traceClient);

        File zipFile = exportPath.toFile();
        assertFalse(zipFile.exists());

        String[] jobs = { jobIds.get(0) };
        manager.exportJobs(exportPath, jobs);

        assertTrue(zipFile.exists());

        ZipFile actual = new ZipFile(zipFile);
        // There should be one job and two trace documents
        assertEquals(3, actual.size());

        actual.close();  
    }

    @Test
    public void exportMultipleJobs() throws IOException, InterruptedException {
        JobManager manager = JobManager.create(jobClient, traceClient);

        File zipFile = exportPath.toFile();
        assertFalse(zipFile.exists());

        String[] jobs = { jobIds.get(0), jobIds.get(1) };
        manager.exportJobs(exportPath, jobs);

        assertTrue(zipFile.exists());
        ZipFile actual = new ZipFile(zipFile);
        // There should be two job and four trace documents
        assertEquals(6, actual.size());

        actual.close();      
    }

    @Test
    public void exportAllJobs() throws IOException {
        JobManager manager = JobManager.create(jobClient, traceClient);

        File zipFile = exportPath.toFile();
        assertFalse(zipFile.exists());

        manager.exportJobs(exportPath, null);

        assertTrue(zipFile.exists());

        ZipFile actual = new ZipFile(zipFile);
        // There should be four job and eight trace documents
        assertEquals(12, actual.size());

        actual.close();      
    }

    @Test
    public void exportNoJobs() throws IOException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME,
            HubConfig.DEFAULT_TRACE_NAME);

        // if the jobs database is empty, do not produce a zip file.
        JobManager manager = JobManager.create(jobClient, traceClient);

        File zipFile = exportPath.toFile();
        assertFalse(zipFile.exists());

        manager.exportJobs(exportPath, null);

        assertFalse(zipFile.exists());
    }

    @Test
    public void importJobs() throws URISyntaxException, IOException {
        URL url = JobManagerTest.class.getClassLoader().getResource("job-manager-test/jobexport.zip");

        clearDatabases(HubConfig.DEFAULT_JOB_NAME, HubConfig.DEFAULT_TRACE_NAME);

        assertEquals(0, getJobDocCount());
        assertEquals(0, getTracingDocCount());

        JobManager manager = JobManager.create(jobClient, traceClient);
        manager.importJobs(Paths.get(url.toURI()));

        assertEquals(4, getJobDocCount());
        assertEquals(8, getTracingDocCount());

        // Check one of the (known) JSON trace documents to make sure it was loaded as JSON
        EvalResultIterator evalResults = runInDatabase("xdmp:type(fn:doc('/5177365055356498236.json'))", HubConfig.DEFAULT_TRACE_NAME);
        if (evalResults.hasNext()) {
            String type = evalResults.next().getString();
            assertEquals("object", type);
        }
        else {
            fail("Trace document was not loaded as JSON");
        }

        // Check one of the (known) XML trace documents to make sure it was loaded as XML
        evalResults = runInDatabase("xdmp:type(fn:doc('/1311179527065924494.xml'))", HubConfig.DEFAULT_TRACE_NAME);
        if (evalResults.hasNext()) {
            String type = evalResults.next().getString();
            assertEquals("untypedAtomic", type);
        }
        else {
            fail("Trace document was not loaded as XML");
        }
    }
}
