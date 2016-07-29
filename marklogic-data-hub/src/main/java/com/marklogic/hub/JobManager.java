package com.marklogic.hub;

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
import com.marklogic.spring.batch.core.MarkLogicJobInstance;
import com.marklogic.spring.batch.hub.MarkLogicJobRepoConfig;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import java.util.ArrayList;
import java.util.List;

public class JobManager extends LoggingObject {

    private final String SEARCH_OPTIONS_NAME = "spring-batch";
    private final String COLLECTION_JOB_EXECUTION = "http://marklogic.com/spring-batch/job-execution";
    private final String COLLECTION_JOB_INSTANCE = "http://marklogic.com/spring-batch/job-instance";
    private final String COLLECTION_STEP_EXECUTION = "http://marklogic.com/spring-batch/step-execution";

    private AnnotationConfigApplicationContext ctx;

    private DatabaseClient databaseClient;

    private HubConfig hubConfig;
    public JobManager(HubConfig hubConfig, DatabaseClient client) {

        this.hubConfig = hubConfig;
        this.databaseClient = client;
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
        XMLDocumentManager mgr = databaseClient.newXMLDocumentManager();
        QueryManager queryMgr = databaseClient.newQueryManager();

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

    protected JAXBContext jaxbContext() {
        JAXBContext jaxbContext;
        try {
            jaxbContext = JAXBContext.newInstance(MarkLogicJobInstance.class);
        } catch (JAXBException ex) {
            throw new RuntimeException(ex);
        }
        return jaxbContext;
    }
}
