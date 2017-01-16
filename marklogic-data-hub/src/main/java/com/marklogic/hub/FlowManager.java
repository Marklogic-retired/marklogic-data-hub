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
package com.marklogic.hub;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.datamovement.QueryBatcher;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.ServerCollector;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.job.Job;
import com.marklogic.hub.job.JobManager;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class FlowManager extends ResourceManager {
    private static final String HUB_NS = "http://marklogic.com/data-hub";
    private static final String NAME = "flow";

    private DatabaseClient stagingClient;
    private DatabaseClient finalClient;
    private DatabaseClient jobClient;
    private HubConfig hubConfig;
    private JobManager jobManager;

    private DataMovementManager dataMovementManager;

    public FlowManager(HubConfig hubConfig) {
        super();
        this.hubConfig = hubConfig;
        this.stagingClient = hubConfig.newStagingClient();
        this.finalClient = hubConfig.newFinalClient();
        this.jobClient = hubConfig.newJobDbClient();
        this.jobManager = new JobManager(this.jobClient);
        this.dataMovementManager = this.stagingClient.newDataMovementManager();
        this.stagingClient.init(NAME, this);
    }

    /**
     * Retrieves a list of flows installed on the MarkLogic server
     *
     * @param entityName
     *            - the entity from which to fetch the flows
     * @return - a list of flows for the given entity
     */
    public List<Flow> getFlows(String entityName) {
        RequestParameters params = new RequestParameters();
        params.add("entity-name", entityName);
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        NodeList children = parent.getDocumentElement().getChildNodes();

        ArrayList<Flow> flows = null;
        if (children.getLength() > 0) {
            flows = new ArrayList<>();
        }

        Node node;
        for (int i = 0; i < children.getLength(); i++) {
            node = children.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                flows.add(flowFromXml((Element)children.item(i)));
            }
        }
        return flows;
    }

    /**
     * Retrieves a named flow from a given entity
     *
     * @param entityName
     *            - the entity that the flow belongs to
     * @param flowName
     *            - the name of the flow to get
     * @return the flow
     */
    public Flow getFlow(String entityName, String flowName) {
        return getFlow(entityName, flowName, null);
    }

    public Flow getFlow(String entityName, String flowName, FlowType flowType) {
        RequestParameters params = new RequestParameters();
        params.add("entity-name", entityName);
        params.add("flow-name", flowName);
        if (flowType != null) {
            params.add("flow-type", flowType.toString());
        }
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        return flowFromXml(parent.getDocumentElement());
    }

    public JobTicket runFlow(Flow flow, int batchSize, int threadCount, JobStatusListener statusListener) {
        return runFlow(flow, batchSize, threadCount, HubDatabase.STAGING, HubDatabase.FINAL, null, statusListener);
    }

    /**
     * Runs a given flow
     * @param flow - the flow to run
     * @param batchSize - the size to use for batching transactions
     * @param threadCount - the number of threads to use
     * @param statusListener - the callback to receive job status updates
     * @return a JobExecution instance
     */
    public JobTicket runFlow(Flow flow, int batchSize, int threadCount, HubDatabase srcDb, HubDatabase destDb, Map<String, Object> options, JobStatusListener statusListener) {

        Collector c = flow.getCollector();
        if (c instanceof ServerCollector) {
            ((ServerCollector)c).setClient(stagingClient);
        }

        AtomicLong successfulEvents = new AtomicLong(0);
        AtomicLong failedEvents = new AtomicLong(0);
        AtomicLong successfulBatches = new AtomicLong(0);
        AtomicLong failedBatches = new AtomicLong(0);

        Vector<String> uris = c.run(options);

        DatabaseClient srcClient;
        if (srcDb.equals(HubDatabase.STAGING)) {
            srcClient = this.stagingClient;
        }
        else {
            srcClient = this.finalClient;
        }
        String targetDatabase;
        if (destDb.equals(HubDatabase.STAGING)) {
            targetDatabase = hubConfig.stagingDbName;
        }
        else {
            targetDatabase = hubConfig.finalDbName;
        }

        FlowRunner flowRunner = new FlowRunner(srcClient, targetDatabase, flow);
        AtomicInteger count = new AtomicInteger(0);
        ArrayList<String> errorMessages = new ArrayList<>();
        QueryBatcher queryBatcher = dataMovementManager.newQueryBatcher(uris.iterator())
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .onUrisReady(batch -> {
                try {
                    RunFlowResponse response = flowRunner.run(batch.getJobTicket().getJobId(), batch.getItems(), options);
                    failedEvents.addAndGet(response.errorCount);
                    successfulEvents.addAndGet(response.totalCount - response.errorCount);
                    successfulBatches.addAndGet(1);
                    count.addAndGet(1);
                }
                catch(Exception e) {
                    errorMessages.add(e.toString());
                }
            })
            .onQueryFailure(failure -> {
               failedBatches.addAndGet(1);
               failedEvents.addAndGet(batchSize);
            });
        JobTicket jobTicket = dataMovementManager.startJob(queryBatcher);
        jobManager.saveJob(Job.withFlow(flow)
            .withJobId(jobTicket.getJobId())
        );

        new Thread(() -> {
            queryBatcher.awaitCompletion();

            if (statusListener != null) {
                statusListener.onJobFinished();
            }
            dataMovementManager.stopJob(queryBatcher);

            // store the thing in MarkLogic
            Job job = Job.withFlow(flow)
                .withJobId(jobTicket.getJobId())
                .setCounts(successfulEvents.get(), failedEvents.get(), successfulBatches.get(), failedBatches.get())
                .withEndTime(new Date());

            if (errorMessages.size() > 0) {
                job.withJobOutput(String.join("\n", errorMessages));
            }
            jobManager.saveJob(job);
        }).start();

        return jobTicket;
    }

    /**
     * Turns an XML document into a flow
     * @param doc - the xml document representing a flow
     * @return a Flow instance
     */
    public static Flow flowFromXml(Element doc) {
        Flow f = null;

        String complexity = null;
        NodeList elements = doc.getElementsByTagNameNS(HUB_NS, "complexity");
        if (elements.getLength() == 1) {
            complexity = elements.item(0).getTextContent();
        }

        if (complexity != null && complexity.equals(FlowComplexity.SIMPLE.toString())) {
            f = new SimpleFlow(doc);
        }

        return f;
    }
}
