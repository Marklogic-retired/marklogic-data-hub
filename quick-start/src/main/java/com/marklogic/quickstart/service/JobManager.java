/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.quickstart.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.document.XMLDocumentManager;
import com.marklogic.client.helper.LoggingObject;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.util.PerformanceLogger;
import com.marklogic.quickstart.model.JobQuery;
import com.marklogic.quickstart.util.QueryHelper;
import com.marklogic.spring.batch.hub.MarkLogicJobRepoConfig;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.util.ArrayList;

public class JobManager extends LoggingObject {

    private static final String SEARCH_OPTIONS_NAME = "spring-batch";
    private static final String COLLECTION_JOB_INSTANCE = "http://marklogic.com/spring-batch/job-instance";

    private AnnotationConfigApplicationContext ctx;

    private HubConfig hubConfig;
    private XMLDocumentManager mgr;
    private QueryManager queryMgr;

    public JobManager(HubConfig hubConfig, DatabaseClient client) {
        this.hubConfig = hubConfig;
        this.mgr = client.newXMLDocumentManager();
        this.queryMgr = client.newQueryManager();
    }

    private JobExplorer explorer() {
        ctx = new AnnotationConfigApplicationContext();
        ctx.register(MarkLogicJobRepoConfig.class);
        ctx.getBeanFactory().registerSingleton("hubConfig", hubConfig);
        ctx.refresh();

        return ctx.getBean(JobExplorer.class);
    }

    private StructuredQueryDefinition addRangeConstraint(StructuredQueryBuilder sb, String name, String value) {
        StructuredQueryDefinition sqd = null;
        if (value != null && !value.isEmpty()) {
            sqd = sb.rangeConstraint(name, StructuredQueryBuilder.Operator.EQ, value);
        }
        return sqd;
    }

    public StringHandle getJobs(JobQuery jobQuery) {
        long startTime = PerformanceLogger.monitorTimeInsideMethod();
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

        StructuredQueryBuilder.AndQuery sqd = sb.and(queries.toArray(new StructuredQueryDefinition[0]));

        String sort = "date-desc";
        String searchXml = QueryHelper.serializeQuery(sb, sqd, sort);

        RawCombinedQueryDefinition querydef = queryMgr.newRawCombinedQueryDefinition(new StringHandle(searchXml), SEARCH_OPTIONS_NAME);
        querydef.setResponseTransform(new ServerTransform("job-search"));
        StringHandle sh = new StringHandle();
        sh.setFormat(Format.JSON);
        StringHandle results = queryMgr.search(querydef, sh, jobQuery.start);
        PerformanceLogger.logTimeInsideMethod(startTime, "JobManager.getJobs()");
        return results;
    }

    public void cancelJob(long jobId) {
        explorer().getJobExecution(jobId).stop();
    }
}
