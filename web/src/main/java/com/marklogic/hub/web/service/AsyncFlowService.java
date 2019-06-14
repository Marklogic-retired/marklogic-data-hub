/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.web.service;

import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.util.metrics.tracer.JaegerConfig;
import com.marklogic.hub.web.exception.DataHubException;
import com.marklogic.hub.web.model.FlowJobModel.FlowJobs;
import com.marklogic.hub.web.model.FlowStepModel;
import io.opentracing.Scope;
import io.opentracing.Span;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AsyncFlowService {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    //core/maximum pool size, can be configurable if required
    private static final int NTHREADS = 6;

    //a thread processes 10 flows, can be configurable if required
    //if the flow number is not more than 10, we do not use any thread in the pool
    private static final int FLOW_COUNT_PER_THREAD = 10;

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private FlowRunnerImpl flowRunner;

    @Autowired
    private FlowJobService flowJobService;

    ExecutorService executor;

    @PostConstruct
    public void init(){
        //we could turn on/off jaeger to trace performance of any call stacks by
        //injecting customized span code along with tags, e.g. try (Scope scope = JaegerConfig.activate(span))
        //default tracing is off, in order to turn on, just add a VM option -DJaegerServiceName=data-hub
        //also see: https://www.jaegertracing.io/docs/1.12/getting-started/
        String jaegerServiceName = System.getProperty("JaegerServiceName");
        if (StringUtils.isNotEmpty(jaegerServiceName)) {
            JaegerConfig.init(jaegerServiceName);
        }

        executor = Executors.newFixedThreadPool(NTHREADS);
        logger.info(String.format("Initialized a fixed thread pool with pool size: %d", NTHREADS));
    }

    @PreDestroy
    public void destroy() {
        executor.shutdown();
        try {
            executor.awaitTermination(Long.MAX_VALUE, TimeUnit.DAYS);
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        logger.info("shutdown the thread pool");
    }

    class FlowStepsWithThreadInfo {
        int groupId;
        long threadId;

        List<FlowStepModel> flowSteps;

        public FlowStepsWithThreadInfo(List<FlowStepModel> flowSteps, int groupId, long threadId) {
            this.flowSteps = flowSteps;
            this.groupId = groupId;
            this.threadId = threadId;
        }
    }

    class FlowStepsCallable implements Callable<FlowStepsWithThreadInfo> {
        List<Flow> flows;
        int start;
        Span parentSpan;
        public FlowStepsCallable(List<Flow> flows, int start, Span parentSpan) {
            this.flows = flows;
            this.start = start;
            this.parentSpan = parentSpan;
        }

        @Override
        public FlowStepsWithThreadInfo call()  {
            FlowStepsWithThreadInfo flowStepsWithThreadInfo;
            Span span = JaegerConfig.buildSpanFromMethod(new Object() {}, parentSpan)
                .withTag("currThread", Thread.currentThread().getId()).start();

            try (Scope ignored = JaegerConfig.activate(span)) {
                List<FlowStepModel> flowSteps = new ArrayList<>();
                int startIdx = start * FLOW_COUNT_PER_THREAD;
                IntStream.range(startIdx, Math.min(flows.size(), startIdx + FLOW_COUNT_PER_THREAD))
                    .forEach(i -> {
                        logger.debug(String
                            .format("thread id: %d, flowName: %s", Thread.currentThread().getId(),
                                flows.get(i).getName()));
                        FlowStepModel fsm = getFlowStepModel(flows.get(i),false, span);
                        flowSteps.add(fsm);
                    });
                flowStepsWithThreadInfo = new FlowStepsWithThreadInfo(flowSteps, start, Thread.currentThread().getId());
            } finally {
                span.finish();
            }
            return flowStepsWithThreadInfo;
        }
    }

    public List<FlowStepModel> getFlows(boolean useThread) {
        FlowRunnerChecker.getInstance(flowRunner);
        List<Flow> flows = flowManager.getFlows();
        List<FlowStepModel> flowSteps = new ArrayList<>();
        if (flows.isEmpty()) {
            return flowSteps;
        }
        int threadCnt = flows.size() / FLOW_COUNT_PER_THREAD;

        Span span = JaegerConfig.buildSpanFromMethod(new Object() {})
            .withTag("mainThread", Thread.currentThread().getId()).start();

        try (Scope ignored = JaegerConfig.activate(span)) {
            if (useThread && threadCnt > 0) {
                asyncGetFlowSteps(flows, threadCnt, flowSteps);
            } else {
                for (Flow flow : flows) {
                    FlowStepModel fsm = getFlowStepModel(flow,false, span);
                    flowSteps.add(fsm);
                }
            }
        } finally {
            span.finish();
        }

        return flowSteps;
    }

    private void asyncGetFlowSteps(List<Flow> flows, int threadCnt, List<FlowStepModel> flowSteps) {
        if (flows.size() % FLOW_COUNT_PER_THREAD != 0) {
            threadCnt++;
        }

        ExecutorCompletionService<FlowStepsWithThreadInfo> ecs = new ExecutorCompletionService(executor);
        Future[] futures = IntStream.range(0, threadCnt)
            .mapToObj(i -> ecs.submit(new FlowStepsCallable(flows, i, JaegerConfig.activeSpan())))
            .toArray(Future[]::new);

        IntStream.range(0, threadCnt).mapToObj(i -> JaegerConfig.buildSpanFromMethod(new Object() {
        }, JaegerConfig.activeSpan())
            .withTag("threadCnt", i).start()).forEach(span -> {
            try (Scope ignored = JaegerConfig.activate(span)) {
                final Future<FlowStepsWithThreadInfo> future = ecs.take();

                FlowStepsWithThreadInfo flowStepsWithThreadInfo = future.get();
                span.setTag("threadId", flowStepsWithThreadInfo.threadId);
                span.setTag("groupId", flowStepsWithThreadInfo.groupId);

                flowSteps.addAll(flowStepsWithThreadInfo.flowSteps);
            } catch (ExecutionException e) {
                logger.error("Failed to get data: ", e.getCause());
                throw new DataHubException("Failed to get data: " + e.getMessage());
            } catch (InterruptedException e) {
                logger.error("Interrupted exception: ", e.getCause());
                throw new DataHubException("Interrupted exception: " + e.getMessage());
            } finally {
                span.finish();
            }
        });
    }

    public FlowStepModel getFlowStepModel(Flow flow, boolean fromRunFlow, Span parentSpan) {
        FlowStepModel fsm = FlowStepModel.transformFromFlow(flow);
        if (fromRunFlow) {
            FlowRunnerChecker.getInstance(flowRunner).resetLatestJob(flow);
        }
        FlowJobs flowJobs;
        if (flowRunner.getRunningFlow() != null && flow.getName().equalsIgnoreCase(flowRunner.getRunningFlow().getName())) {
            fsm.setLatestJob(FlowRunnerChecker.getInstance(flowRunner).getLatestJob(flow));
        }
        if (fsm.latestJob != null  && (JobStatus.isJobDone(fsm.latestJob.status) || JobStatus.isStepDone(fsm.latestJob.status))) {
            flowJobs = flowJobService.getJobs(flow,true, parentSpan);
        } else {
            flowJobs = flowJobService.getJobs(flow,false, parentSpan);
        }
        fsm.setJobs(flowJobs, fromRunFlow);
        return fsm;
    }
}
