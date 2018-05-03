/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.quickstart.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.job.JobDeleteResponse;
import com.marklogic.hub.job.JobExportResponse;
import com.marklogic.hub.job.JobManager;
import com.marklogic.quickstart.model.JobQuery;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;

public class JobService extends SearchableService {

    private static final String SEARCH_OPTIONS_NAME = "jobs";

    private QueryManager queryMgr;

    private JobManager jobMgr;


    public JobService(DatabaseClient jobClient, DatabaseClient traceClient) {
        this.queryMgr = jobClient.newQueryManager();
        this.jobMgr = JobManager.create(jobClient, traceClient);
    }

    public StringHandle getJobs(JobQuery jobQuery) {
        queryMgr.setPageLength(jobQuery.count);

        StructuredQueryBuilder sb = queryMgr.newStructuredQueryBuilder(SEARCH_OPTIONS_NAME);

        ArrayList<StructuredQueryDefinition> queries = new ArrayList<>();
        if (jobQuery.query != null && !jobQuery.query.equals("")) {
            queries.add(sb.term(jobQuery.query));
        }

        StructuredQueryDefinition def = addRangeConstraint(sb, "status", jobQuery.status);
        if (def != null) {
            queries.add(def);
        }


        def = addRangeConstraint(sb, "entityName", jobQuery.entityName);
        if (def != null) {
            queries.add(def);
        }

        def = addRangeConstraint(sb, "flowName", jobQuery.flowName);
        if (def != null) {
            queries.add(def);
        }

        def = addRangeConstraint(sb, "flowType", jobQuery.flowType);
        if (def != null) {
            queries.add(def);
        }

        StructuredQueryDefinition sqd = sb.and(queries.toArray(new StructuredQueryDefinition[0]));

        String searchXml = sqd.serialize();

        RawCombinedQueryDefinition querydef = queryMgr.newRawCombinedQueryDefinition(new StringHandle(searchXml), SEARCH_OPTIONS_NAME);
        querydef.setResponseTransform(new ServerTransform("ml:jobSearchResults"));
        StringHandle sh = new StringHandle();
        sh.setFormat(Format.JSON);
        return queryMgr.search(querydef, sh, jobQuery.start);
    }

    public JobDeleteResponse deleteJobs(String jobIds) {
        return this.jobMgr.deleteJobs(jobIds);
    }

    public File exportJobs(String[] jobIds) throws IOException {
        Path exportPath = Files.createTempFile("jobexport", ".zip");
        JobExportResponse jobExportResponse = this.jobMgr.exportJobs(exportPath, jobIds);
        File zipfile = new File(jobExportResponse.fullPath);
        return zipfile;
    }

    public void cancelJob(long jobId) {

    }
}
