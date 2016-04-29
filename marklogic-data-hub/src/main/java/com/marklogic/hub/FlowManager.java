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

import java.util.ArrayList;
import java.util.List;

import javax.xml.stream.XMLStreamException;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.core.job.builder.SimpleJobBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.support.SimpleJobLauncher;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.repository.support.MapJobRepositoryFactoryBean;
import org.springframework.batch.core.step.tasklet.TaskletStep;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.support.transaction.ResourcelessTransactionManager;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.Transaction;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.ServerCollector;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.flow.SimpleFlow;
import com.marklogic.spring.batch.hub.CollectorReader;
import com.marklogic.spring.batch.hub.FlowWriter;

public class FlowManager extends ResourceManager {
    private static final String HUB_NS = "http://marklogic.com/data-hub";
    private static final String NAME = "flow";
    private static final int DEFAULT_THREAD_COUNT = 8;

    private DatabaseClient client;

    private JobBuilderFactory jobBuilderFactory;
    private StepBuilderFactory stepBuilderFactory;
    private JobLauncher jobLauncher;
    private ThreadPoolTaskExecutor executor;
    private int threadCount = DEFAULT_THREAD_COUNT;

    public FlowManager(DatabaseClient client) {
        super();
        this.client = client;
        this.client.init(NAME, this);
        initializeDefaultSpringBatchComponents();
    }

    public void setThreadCount(int count) {
        threadCount = count;
        executor.setCorePoolSize(threadCount);
        executor.setMaxPoolSize(threadCount);
    }

    protected void initializeDefaultSpringBatchComponents() {
        ResourcelessTransactionManager transactionManager = new ResourcelessTransactionManager();
        MapJobRepositoryFactoryBean f = new MapJobRepositoryFactoryBean(transactionManager);
        try {
            f.afterPropertiesSet();
            JobRepository jobRepository = f.getObject();
            this.jobBuilderFactory = new JobBuilderFactory(jobRepository);
            this.stepBuilderFactory = new StepBuilderFactory(jobRepository, transactionManager);
            SimpleJobLauncher jbl = new SimpleJobLauncher();
            jbl.setJobRepository(jobRepository);

            this.executor = new ThreadPoolTaskExecutor();
            executor.setCorePoolSize(threadCount);
            executor.setMaxPoolSize(threadCount);
            executor.initialize();
            executor.setWaitForTasksToCompleteOnShutdown(true);
            jbl.setTaskExecutor(executor);

            jbl.afterPropertiesSet();
            this.jobLauncher = jbl;
        } catch (Exception ex) {
            throw new RuntimeException("Unable to initialize SqlMigrator, cause: " + ex.getMessage(), ex);
        }
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
            flows = new ArrayList<Flow>();
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

    public void installFlow(Flow flow) {

    }

    public void uninstallFlow(String flowName) {

    }

    public JobExecution runFlow(Flow flow, int batchSize) {
        return runFlow(flow, batchSize, null);
    }

    // might want to add Job tracking support
    // by returning a Job or some such.
    // Depends a lot on if we go full in with spring batch or not
    /**
     * Runs a given flow
     * @param flow - the flow to run
     * @param batchSize - the size to use for batching transactions
     * @param listener - the JobExecutionListener to receive status updates about the job
     * @return
     */
    public JobExecution runFlow(Flow flow, int batchSize, JobExecutionListener listener) {
        Collector c = flow.getCollector();
        if (c instanceof ServerCollector) {
            ((ServerCollector)c).setClient(client);
        }
        ItemReader<String> reader = new CollectorReader(c);
        ItemWriter<String> writer = new FlowWriter(client, flow);

        TaskletStep step = stepBuilderFactory.get("testStep")
                .<String, String> chunk(batchSize)
                .reader(reader).writer(writer).build();

        String jobName = flow.getEntityName() + ":" + flow.getType() + ":"
                + flow.getName() + "-" + System.currentTimeMillis();
        SimpleJobBuilder builder = jobBuilderFactory.get(jobName).start(step);
        if (listener != null) {
            builder = builder.listener(listener);
        }
        Job job = builder.build();

        try {
            return jobLauncher.run(job, new JobParameters());
        }
        catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void runFlowsInParallel(Flow ... flows) {

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

        if (complexity.equals(FlowComplexity.SIMPLE.toString())) {
            SimpleFlow sf = new SimpleFlow(doc);
            f = sf;
        }

        return f;
    }

    /**
     * A class to run a flow
     */
    class FlowRunner extends ResourceManager {
        private static final String NAME = "flow";

        public FlowRunner(DatabaseClient client, Flow flow, String identifier, Transaction transaction) {
            super();
            client.init(NAME, this);
        }

        /**
         * Runs the given flow
         * @param flow - flow to run
         * @param identifier - the identifier to pass to the flow (Can be a URI or any string)
         * @param transaction - the transaction to apply to this request
         * @throws XMLStreamException
         */
        public void run(Flow flow, String identifier, Transaction transaction) {
            RequestParameters params = new RequestParameters();
            params.add("identifier", identifier);

            StringHandle handle = new StringHandle(flow.serialize(true));
            handle.setFormat(Format.XML);
            this.getServices().post(params, handle, transaction);
        }
    }
	public JobExecution testFlow(Flow flow) {
	    return null;
	}
}
