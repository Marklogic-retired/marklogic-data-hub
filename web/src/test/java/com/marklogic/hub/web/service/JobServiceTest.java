/*
 * Copyright 2012-2019 MarkLogic Corporation
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

package com.marklogic.hub.web.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.web.WebApplication;
import com.marklogic.hub.web.model.JobQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {WebApplication.class, ApplicationConfig.class, LegacyFlowManagerServiceTest.class})
public class JobServiceTest extends HubTestBase {

    @BeforeEach
    public void setup() throws IOException {
        deleteProjectDir();
        createProjectDir();
    }

    @Test
    public void getJobs() {
        DatabaseClient jobClient = getDataHubAdminConfig().newJobDbClient();
        JobService jobService = new JobService(jobClient);
        JobQuery jobQuery = new JobQuery();
        jobQuery.start = Long.valueOf(1);
        jobQuery.count = Long.valueOf(10);
        jobService.getJobs(jobQuery);
    }
}
