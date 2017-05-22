/*
 * Copyright 2015-2017 MarkLogic Corporation
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
package com.marklogic.client.datamovement.impl;

import java.util.ArrayList;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.impl.DatabaseClientImpl;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.datamovement.Batcher;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.datamovement.JobTicket.JobType;
import com.marklogic.client.datamovement.QueryBatcher;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.datamovement.JobReport;
import com.marklogic.client.datamovement.impl.ForestConfigurationImpl;
import java.util.List;

public class DataMovementServices {
    private DatabaseClient client;

    public DatabaseClient getClient() {
        return client;
    }

    public DataMovementServices setClient(DatabaseClient client) {
        this.client = client;
        return this;
    }

    public ForestConfigurationImpl readForestConfig() {
        List<ForestImpl> forests = new ArrayList<>();
        JsonNode results = ((DatabaseClientImpl) client).getServices()
            .getResource(null, "resources/forest-info", null, null, new JacksonHandle())
            .get();
        for ( JsonNode forestNode : results ) {
            String id = forestNode.get("id").asText();
            String name = forestNode.get("name").asText();
            String database = forestNode.get("database").asText();
            String host = forestNode.get("host").asText();
            String openReplicaHost = null;
            if ( forestNode.get("openReplicaHost") != null ) openReplicaHost = forestNode.get("openReplicaHost").asText();
            String alternateHost = null;
            if ( forestNode.get("alternateHost") != null ) alternateHost = forestNode.get("alternateHost").asText();
            boolean isUpdateable = "all".equals(forestNode.get("updatesAllowed").asText());
            boolean isDeleteOnly = false; // TODO: get this for real after we start using a REST endpoint
            forests.add(new ForestImpl(host, alternateHost, openReplicaHost, database, name, id, isUpdateable, isDeleteOnly));
        }

        return new ForestConfigurationImpl(forests.toArray(new ForestImpl[forests.size()]));
    }

    public JobTicket startJob(WriteBatcher batcher) {
        JobTicket jobTicket = new JobTicketImpl(generateJobId(), JobTicket.JobType.WRITE_BATCHER)
            .withWriteBatcher((WriteBatcherImpl) batcher);
        ((WriteBatcherImpl) batcher).start(jobTicket);
        return jobTicket;
    }

    public JobTicket startJob(QueryBatcher batcher) {
        JobTicket jobTicket = new JobTicketImpl(generateJobId(), JobTicket.JobType.QUERY_BATCHER)
            .withQueryBatcher((QueryBatcherImpl) batcher);
        ((QueryBatcherImpl) batcher).start(jobTicket);
        return jobTicket;
    }

    public JobReport getJobReport(JobTicket ticket) {
        if ( ticket instanceof JobTicketImpl ) {
            JobTicketImpl ticketImpl = (JobTicketImpl) ticket;
            if ( ticketImpl.getJobType() == JobType.WRITE_BATCHER ) {
                return new JobReportImpl(ticketImpl.getWriteBatcher());
            } else if ( ticketImpl.getJobType() == JobType.QUERY_BATCHER ) {
                return new JobReportImpl(ticketImpl.getQueryBatcher());
            }
        }
        return null;
    }

    public void stopJob(JobTicket ticket) {
        if ( ticket instanceof JobTicketImpl ) {
            JobTicketImpl ticketImpl = (JobTicketImpl) ticket;
            if ( ticketImpl.getJobType() == JobType.WRITE_BATCHER ) {
                ticketImpl.getWriteBatcher().stop();
            } else if ( ticketImpl.getJobType() == JobType.QUERY_BATCHER ) {
                ticketImpl.getQueryBatcher().stop();
            }
        }
    }

    public void stopJob(Batcher batcher) {
        if ( batcher instanceof QueryBatcherImpl ) {
            ((QueryBatcherImpl) batcher).stop();
        } else if ( batcher instanceof WriteBatcherImpl ) {
            ((WriteBatcherImpl) batcher).stop();
        }
    }

    private String generateJobId() {
        return UUID.randomUUID().toString();
    }
}
