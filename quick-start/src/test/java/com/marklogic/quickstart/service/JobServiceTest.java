package com.marklogic.quickstart.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.quickstart.model.JobQuery;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.IOException;

public class JobServiceTest extends HubTestBase {
    @BeforeClass
    public static void setup() throws IOException {
        deleteProjectDir();
        installHub();
    }

    @Test
    public void getJobs() {
        DatabaseClient traceClient = DatabaseClientFactory.newClient("localhost", HubConfig.DEFAULT_JOB_PORT, "admin", "admin", DatabaseClientFactory.Authentication.DIGEST);
        JobService jobService = new JobService(traceClient);
        JobQuery jobQuery = new JobQuery();
        jobQuery.start = new Long(1);
        jobQuery.count = new Long(10);
        jobService.getJobs(jobQuery);
    }
}
