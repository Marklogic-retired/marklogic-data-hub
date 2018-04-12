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
import com.marklogic.hub.HubTestBase;
import com.marklogic.quickstart.model.JobQuery;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

public class JobServiceTest extends HubTestBase {

    @Before
    public void setup() throws IOException {
        deleteProjectDir();
        createProjectDir();
    }

    @Test
    public void getJobs() {
        DatabaseClient jobClient = getHubConfig().newJobDbClient();
        JobService jobService = new JobService(jobClient, jobClient);
        JobQuery jobQuery = new JobQuery();
        jobQuery.start = new Long(1);
        jobQuery.count = new Long(10);
        jobService.getJobs(jobQuery);
    }
}
