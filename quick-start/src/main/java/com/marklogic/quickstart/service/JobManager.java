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
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.document.DocumentRecord;
import com.marklogic.client.document.XMLDocumentManager;
import com.marklogic.client.helper.LoggingObject;
import com.marklogic.client.io.JAXBHandle;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawStructuredQueryDefinition;
import com.marklogic.hub.HubConfig;
import com.marklogic.spring.batch.core.MarkLogicJobInstance;
import com.marklogic.spring.batch.hub.MarkLogicJobRepoConfig;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import java.util.ArrayList;
import java.util.List;

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

    public List<MarkLogicJobInstance> getJobInstances(long start, long count) {
        List<MarkLogicJobInstance> jobInstances = new ArrayList<>();

        String sort = "date-desc";
        StringHandle rawHandle = new StringHandle(
            "<search xmlns=\"http://marklogic.com/appservices/search\">\n" +
            "  <query>\n" +
            "    <collection-query>\n" +
            "      <uri>" + COLLECTION_JOB_INSTANCE + "</uri>\n" +
            "    </collection-query>\n" +
            "    <operator-state>\n" +
            "      <operator-name>sort</operator-name>\n" +
            "      <state-name>" + sort + "</state-name>\n" +
            "    </operator-state>\n" +
            "  </query>  \n" +
            "</search>");
        RawStructuredQueryDefinition querydef = queryMgr.newRawStructuredQueryDefinition(rawHandle, SEARCH_OPTIONS_NAME);
        mgr.setPageLength(count);

        DocumentPage page = mgr.search(querydef, start, new SearchHandle());
        while(page.hasNext()) {
            DocumentRecord record = page.next();
            JAXBHandle<MarkLogicJobInstance> jaxbHandle = new JAXBHandle<>(jaxbContext());
            record.getContent(jaxbHandle);
            MarkLogicJobInstance mji = jaxbHandle.get();
            jobInstances.add(mji);
        }
        return jobInstances;
    }

    public void cancelJob(long jobId) {
        explorer().getJobExecution(jobId).stop();
    }

    private JAXBContext jaxbContext() {
        JAXBContext jaxbContext;
        try {
            jaxbContext = JAXBContext.newInstance(MarkLogicJobInstance.class);
        } catch (JAXBException ex) {
            throw new RuntimeException(ex);
        }
        return jaxbContext;
    }
}
