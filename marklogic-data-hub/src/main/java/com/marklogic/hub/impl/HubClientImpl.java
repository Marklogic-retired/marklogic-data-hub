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
package com.marklogic.hub.impl;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.collector.impl.CollectorImpl;
import com.marklogic.mgmt.ManageClient;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

public class HubClientImpl implements HubClient {

    private String username;
    private DatabaseClient stagingClient;
    private DatabaseClient finalClient;
    private DatabaseClient jobsClient;
    private Map<DatabaseKind, String> databaseNames;
    private RestTemplate stagingRestTemplate;
    private ManageClient manageClient;

    public HubClientImpl(HubConfigImpl hubConfig, Map<DatabaseKind, String> databaseNames) {
        username = hubConfig.getMlUsername();
        stagingClient = hubConfig.newStagingClient(null);
        finalClient = hubConfig.newFinalClient(null);
        jobsClient = hubConfig.newJobDbClient();
        this.databaseNames = databaseNames;

        // TODO Move the newRestTemplate method into a more logical place to reuse this
        this.stagingRestTemplate = CollectorImpl.newRestTemplate(stagingClient, hubConfig.getMlUsername(), hubConfig.getMlPassword());

        this.manageClient = hubConfig.getManageClient();
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getDbName(DatabaseKind kind) {
        return databaseNames.get(kind);
    }

    @Override
    public DatabaseClient getStagingClient() {
        return stagingClient;
    }

    @Override
    public DatabaseClient getFinalClient() {
        return finalClient;
    }

    @Override
    public DatabaseClient getJobsClient() {
        return jobsClient;
    }

    @Override
    public RestTemplate getStagingRestTemplate() {
        return stagingRestTemplate;
    }

    @Override
    public ManageClient getManageClient() {
        return manageClient;
    }
}
