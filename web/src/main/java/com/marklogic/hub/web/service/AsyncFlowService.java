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
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

@Service
@PropertySource({"classpath:dhf-defaults.properties"})
public class AsyncFlowService implements InitializingBean, DisposableBean {

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    //core/maximum pool size, can be configurable if required
    private static final int NTHREADS = 4;

    //a thread processes 10 flows, can be configurable if required
    //if the flow number is not more than 30, we do not use any thread in the pool
    private static final int FLOW_COUNT_PER_THREAD = 30;

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private FlowRunnerImpl flowRunner;

    @Autowired
    private FlowJobService flowJobService;

    ExecutorService executor;

    @Value("${JaegerServiceName}")
    private String jaegerServiceName;

    public void init() {
        //we could turn on/off jaeger to trace performance of any call stacks by
        //injecting customized span code along with tags, e.g. try (Scope scope = JaegerConfig.activate(span))
        //default tracing is off. In order to turn it on, set JaegerServiceName with a value defined in the dhf-defaults.properties file
        //or just add a VM option -DJaegerServiceName=data-hub as a system parameter
        //also see: https://www.jaegertracing.io/docs/1.12/getting-started/
        if (StringUtils.isNotEmpty(jaegerServiceName)) {
            JaegerConfig.init(jaegerServiceName);
        }
        executor = Executors.newFixedThreadPool(NTHREADS);
        logger.info(String.format("Initialized a fixed thread pool with pool size: %d", NTHREADS));
    }

    public void destroy() {
        executor.shutdown();
        try {
            executor.awaitTermination(Long.MAX_VALUE, TimeUnit.DAYS);
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        logger.info("shutdown the thread pool");
    }

    /**
     * Invoked by the containing {@code BeanFactory} after it has set all bean properties
     * and satisfied {@link BeanFactoryAware}, {@code ApplicationContextAware} etc.
     * <p>This method allows the bean instance to perform validation of its overall
     * configuration and final initialization when all bean properties have been set.
     *
     * @throws Exception in the event of misconfiguration (such as failure to set an
     *                   essential property) or if initialization fails for any other reason
     */
    @Override
    public void afterPropertiesSet() throws Exception {
        init();
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
        public FlowStepsWithThreadInfo call() {
            FlowStepsWithThreadInfo flowStepsWithThreadInfo;
            Span span = JaegerConfig.buildSpanFromMethod(new Object() {
            }, parentSpan)
                .withTag("currThread", Thread.currentThread().getId()).start();

            try (Scope ignored = JaegerConfig.activate(span)) {
                List<FlowStepModel> flowSteps = new ArrayList<>();
                int startIdx = start * FLOW_COUNT_PER_THREAD;
                List<Flow> flowGroup = new ArrayList<>();
                IntStream.range(startIdx, Math.min(flows.size(), startIdx + FLOW_COUNT_PER_THREAD))
                    .forEach(i -> {
                        flowGroup.add(flows.get(i));
                    });
                Map<String, FlowJobs> jobMap = flowJobService.getFlowJobs(flowGroup, span);
                IntStream.range(startIdx, Math.min(flows.size(), startIdx + FLOW_COUNT_PER_THREAD))
                    .forEach(i -> {
                        logger.debug(String
                            .format("thread id: %d, flowName: %s", Thread.currentThread().getId(),
                                flows.get(i).getName()));
                        FlowStepModel fsm = getFlowStepModel(flows.get(i), false, jobMap);
                        flowSteps.add(fsm);
                    });
                flowStepsWithThreadInfo = new FlowStepsWithThreadInfo(flowSteps, start,
                    Thread.currentThread().getId());
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

        Span span = JaegerConfig.buildSpanFromMethod(new Object() {
        })
            .withTag("mainThread", Thread.currentThread().getId()).start();

        try (Scope ignored = JaegerConfig.activate(span)) {
            if (useThread && threadCnt > 0) {
                asyncGetFlowSteps(flows, threadCnt, flowSteps);
            } else {
                Map<String, FlowJobs> jobMap = flowJobService.getFlowJobs(flows, span);
                for (Flow flow : flows) {
                    FlowStepModel fsm = getFlowStepModel(flow, false, jobMap);
                    flowSteps.add(fsm);
                }
            }
            flowJobService.firstTimeRun = false;
        } finally {
            span.finish();
        }

        return flowSteps;
    }

    public FlowStepModel getFlowStepModel(Flow flow, boolean fromRunFlow,
        Map<String, FlowJobs> jobMap) {
        FlowStepModel fsm = FlowStepModel.transformFromFlow(flow);
        if (fromRunFlow) {
            FlowRunnerChecker.getInstance(flowRunner).resetLatestJob(flow);
        }
        FlowJobs flowJobs;
        if (jobMap != null) {
            flowJobs = jobMap.get(flow.getName());
        } else {
            if (fsm.latestJob != null && (JobStatus.isJobDone(fsm.latestJob.status) || JobStatus
                .isStepDone(fsm.latestJob.status))) {
                flowJobs = flowJobService.getJobsByFlow(flow, true);
            } else {
                flowJobs = flowJobService.getJobsByFlow(flow, false);
            }
        }
        fsm.setJobs(flowJobs, fromRunFlow);

        //If flow is running, update FlowStepModel at the end
        //check if status in fsm is running, if so call setLatestJob()
        if ((fsm.latestJob != null && fsm.latestJob.status != null && fsm.latestJob.status.contains(JobStatus.RUNNING_PREFIX))
            || (flowRunner.getRunningFlow() != null && flow.getName()
            .equalsIgnoreCase(flowRunner.getRunningFlow().getName()))) {
            fsm.setLatestJob(FlowRunnerChecker.getInstance(flowRunner).getLatestJob(flow));
        }

        return fsm;
    }

    private void asyncGetFlowSteps(List<Flow> flows, int threadCnt, List<FlowStepModel> flowSteps) {
        if (flows.size() % FLOW_COUNT_PER_THREAD != 0) {
            threadCnt++;
        }

        ExecutorCompletionService<FlowStepsWithThreadInfo> ecs = new ExecutorCompletionService(
            executor);
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
}
