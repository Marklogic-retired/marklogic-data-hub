package com.marklogic.hub.flow.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.JobService;
// This is explicitly imported to avoid compile errors with Java 9 or higher, where Flow cannot be
// distinguished from java.util.concurrent.Flow
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.step.StepRunner;
import com.marklogic.hub.step.StepRunnerFactory;
import com.marklogic.hub.step.impl.Step;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Component
public class FlowRunnerImpl implements FlowRunner {

    @Autowired
    private HubConfig hubConfig;

    @Autowired
    private FlowManager flowManager;

    // Only populated when constructed with a HubClient, which implies that a HubProject is not available
    private HubClient hubClient;

    private AtomicBoolean isRunning = new AtomicBoolean(false);
    private AtomicBoolean isJobCancelled = new AtomicBoolean(false);
    private AtomicBoolean isJobSuccess = new AtomicBoolean(true);
    private AtomicBoolean jobStoppedOnError = new AtomicBoolean(false);
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    private String runningJobId;
    private Step runningStep;
    private Flow runningFlow;

    private StepRunner stepRunner;

    /*
     * Using concrete type ConcurrentHashMap instead of Map so coverity static scan does not complain about
     * "modification without proper synchronization" when we call `remove(key)` on the `stepsMap` later in the code.
     */
    private final ConcurrentHashMap<String, Queue<String>> stepsMap = new ConcurrentHashMap<>();
    private Map<String, Flow> flowMap = new ConcurrentHashMap<>();
    private Map<String, RunFlowResponse> flowResp = new ConcurrentHashMap<>();

    // TODO Hoping to combine these maps together into a single one soon
    private Map<String, FlowContext> flowContextMap = new ConcurrentHashMap<>();

    private Queue<String> jobQueue = new ConcurrentLinkedQueue<>();

    private ThreadPoolExecutor threadPool;

    public FlowRunnerImpl() {
    }

    /**
     * Simulates construction of this object via Spring, where the Autowired objects are set manually.
     *
     * @param hubConfig
     * @param flowManager
     */
    public FlowRunnerImpl(HubConfig hubConfig, FlowManager flowManager) {
        this.hubConfig = hubConfig;
        this.flowManager = flowManager;
    }

    /**
     * Convenience constructor for running flows with no dependency on project files on the filesystem, and where a
     * user can authenticate with just a username and a password.
     *
     * @param host the host of the Data Hub instance to connect to
     * @param username the username of the MarkLogic user for running a flow
     * @param password the password of the MarkLogic user for running a flow
     */
    public FlowRunnerImpl(String host, String username, String password) {
        this(new HubConfigImpl(host, username, password).newHubClient());
    }

    /**
     * Constructs a FlowRunnerImpl that can be used for running flows without any reference to project files on a
     * filesystem - and thus, this constructor will not instantiate an instance of FlowManager, which is used for reading
     * project files from the filesystem.
     *
     * This constructor handles ensuring that step definitions are retrieved from MarkLogic as opposed to from the
     * filesystem. It is expected that the "runFlow(FlowInputs)" method will then be used, which ensures that flow
     * artifacts are also retrieved from MarkLogic as opposed to from the filesystem.
     *
     * @param hubClient
     */
    public FlowRunnerImpl(HubClient hubClient) {
        this.hubClient = hubClient;
        this.flowManager = new FlowManagerImpl(hubClient);
    }

    @Deprecated // since 5.3.0-beta; must be retained because the 5.2 dh-5-example project used it in an example. Should use FlowRunnerImpl(HubClient) instead.
    public FlowRunnerImpl(HubConfig hubConfig) {
        this(hubConfig.newHubClient());
    }

    @Deprecated
    public RunFlowResponse runFlow(String flowName) {
        return runFlow(flowName, null, null, new HashMap<>(), new HashMap<>());
    }

    @Deprecated
    public RunFlowResponse runFlow(String flowName, List<String> stepNums) {
        return runFlow(flowName, stepNums, null, new HashMap<>(), new HashMap<>());
    }

    @Deprecated
    public RunFlowResponse runFlow(String flowName, String jobId) {
        return runFlow(flowName, null, jobId, new HashMap<>(), new HashMap<>());
    }

    @Deprecated
    public RunFlowResponse runFlow(String flowName, List<String> stepNums, String jobId) {
        return runFlow(flowName, stepNums, jobId, new HashMap<>(), new HashMap<>());
    }

    @Deprecated
    public RunFlowResponse runFlow(String flowName, String jobId, Map<String, Object> runtimeOptions) {
        return runFlow(flowName, null, jobId, runtimeOptions, new HashMap<>());
    }

    @Deprecated
    public RunFlowResponse runFlow(String flowName, List<String> stepNums,  String jobId, Map<String, Object> runtimeOptions) {
        return runFlow(flowName, stepNums, jobId, runtimeOptions, new HashMap<>());
    }

    @Deprecated
    public RunFlowResponse runFlow(String flowName, List<String> stepNums, String jobId, Map<String, Object> runtimeOptions, Map<String, Object> stepConfig) {
        Flow flow = flowManager.getFullFlow(flowName);
        if (flow == null) {
            throw new RuntimeException("Flow " + flowName + " not found");
        }
        return runFlow(flow, stepNums, jobId, runtimeOptions, stepConfig);
    }

    /**
     * Retrieves the given flow from the staging database in MarkLogic, and then proceeds with the normal execution of
     * the flow.
     *
     * @param flowInputs
     * @return
     */
    @Override
    public RunFlowResponse runFlow(FlowInputs flowInputs) {
        final String flowName = flowInputs.getFlowName();
        if (StringUtils.isEmpty(flowName)) {
            throw new IllegalArgumentException("Cannot run flow; no flow name provided");
        }
        Flow flow = flowManager.getFullFlow(flowName);
        return runFlow(flow, flowInputs.getSteps(), flowInputs.getJobId(), flowInputs.getOptions(), flowInputs.getStepConfig());
    }

    protected RunFlowResponse runFlow(Flow flow, List<String> stepNumbers, String jobId, Map<String, Object> runtimeOptions, Map<String, Object> stepConfig) {
        FlowContext flowContext = new FlowContext(flow, runtimeOptions);
        if (flowContext.jobOutputIsEnabled) {
            flowContext.jobService = JobService.on(hubClient != null ? hubClient.getJobsClient() : hubConfig.newJobDbClient());
        }

        configureStopOnError(flow, runtimeOptions);

        if(stepNumbers == null) {
            stepNumbers = new ArrayList<>(flow.getSteps().keySet());
        }

        if(stepConfig != null && !stepConfig.isEmpty()) {
            flow.setOverrideStepConfig(stepConfig);
        }

        flow.setRuntimeOptions(runtimeOptions);

        Iterator<String> stepItr = stepNumbers.iterator();
        Queue<String> stepsQueue = new ConcurrentLinkedQueue<>();
        while(stepItr.hasNext()) {
            String stepNum = stepItr.next();
            Step tmpStep = flow.getStep(stepNum);
            if(tmpStep == null){
                throw new RuntimeException("Step " + stepNum + " not found in the flow");
            }
            stepsQueue.add(stepNum);
        }

        if(jobId == null) {
            jobId = UUID.randomUUID().toString();
        }
        RunFlowResponse response = new RunFlowResponse(jobId);
        response.setFlowName(flow.getName());

        //Put response, steps and flow in maps with jobId as key
        flowResp.put(jobId, response);
        stepsMap.put(jobId, stepsQueue);
        flowMap.put(jobId, flow);
        flowContextMap.put(jobId, flowContext);

        //add jobId to a queue
        jobQueue.add(jobId);
        if(!isRunning.get()){
            // Construct a stepRunnerFactory for the execution of this flow. It will be passed to additional instances
            // of FlowRunnerTask that need to be created.
            StepRunnerFactory stepRunnerFactory = hubClient != null ?
                new StepRunnerFactory(hubClient) : new StepRunnerFactory(hubConfig);
            initializeFlow(stepRunnerFactory, jobId);
        }
        return response;
    }

    /**
     * To support the "failHard" parameter in CommandLineFlowInputs, this method checks for stopOnError in the options
     * map. If true, this will set stopOnError in the flow. That will cause no other steps to be run once a step fails.
     *
     * @param flow
     * @param options
     */
    protected void configureStopOnError(Flow flow, Map<String, Object> options) {
        if (options != null) {
            Object value = options.get("stopOnError");
            if (Boolean.TRUE.equals(value) || "true".equals(value)) {
                flow.setStopOnError(true);
            }
        }
    }

    private void initializeFlow(StepRunnerFactory stepRunnerFactory, String jobId) {
        //Reset the states to initial values before starting a flow run
        isRunning.set(true);
        isJobSuccess.set(true);
        isJobCancelled.set(false);
        jobStoppedOnError.set(false);
        runningJobId = jobId;
        runningFlow = flowMap.get(runningJobId);

        FlowContext flowContext = flowContextMap.get(jobId);

        if (flowContext.jobOutputIsEnabled) {
            flowContext.jobService.startJob(jobId, runningFlow.getName());
        }

        if(threadPool == null || threadPool.isTerminated()) {
            // thread pool size needs to be at least 2, so the current step thread can kick-off the next step thread
            int maxPoolSize = Math.max(Runtime.getRuntime().availableProcessors()/2, 2);
            threadPool = new CustomPoolExecutor(2, maxPoolSize, 0L, TimeUnit.MILLISECONDS
                , new LinkedBlockingQueue<Runnable>());
        }

        threadPool.execute(new FlowRunnerTask(stepRunnerFactory, runningFlow, runningJobId));
    }

    public void stopJob(String jobId) {
        if (stepsMap.get(jobId) != null) {
            stepsMap.get(jobId).clear();
            stepsMap.remove(jobId);
            isJobCancelled.set(true);
        }

        if (jobId != null && jobId.equals(runningJobId)) {
            if (stepRunner != null) {
                stepRunner.stop();
            }
        }
    }

    protected void copyJobDataToResponse(RunFlowResponse response, RunFlowResponse jobDocument) {
        response.setStartTime(jobDocument.getStartTime());
        response.setEndTime(jobDocument.getEndTime());
        response.setUser(jobDocument.getUser());
        response.setLastAttemptedStep(jobDocument.getLastAttemptedStep());
        response.setLastCompletedStep(jobDocument.getLastCompletedStep());
    }

    private class FlowRunnerTask implements Runnable {

        private StepRunnerFactory stepRunnerFactory;
        private String jobId;
        private Flow flow;
        private Queue<String> stepQueue;

        public Queue<String> getStepQueue() {
            return stepQueue;
        }

        FlowRunnerTask(StepRunnerFactory stepRunnerFactory, Flow flow, String jobId) {
            this.stepRunnerFactory = stepRunnerFactory;
            this.jobId = jobId;
            this.flow = flow;
        }

        @Override
        public void run() {
            RunFlowResponse resp = flowResp.get(runningJobId);
            resp.setFlowName(runningFlow.getName());
            stepQueue = stepsMap.get(jobId);

            FlowContext flowContext = flowContextMap.get(jobId);

            Map<String, RunStepResponse> stepOutputs = new HashMap<>();
            String stepNum = null;

            while (! stepQueue.isEmpty()) {
                stepNum = stepQueue.poll();
                runningStep = runningFlow.getSteps().get(stepNum);
                Map<String, Object> runtimeOptions = flow.getRuntimeOptions() != null ?
                    new HashMap<>(flow.getRuntimeOptions()) : new HashMap<>();

                AtomicLong errorCount = new AtomicLong();
                AtomicLong successCount = new AtomicLong();
                RunStepResponse stepResp = null;

                try {
                    stepRunner = stepRunnerFactory.getStepRunner(runningFlow, stepNum)
                        .withJobId(jobId)
                        .withRuntimeOptions(runtimeOptions)
                        .onItemComplete((jobID, itemID) -> {
                            successCount.incrementAndGet();
                        })
                        .onItemFailed((jobId, itemId)-> {
                            errorCount.incrementAndGet();
                            if(flow.isStopOnError()){
                                jobStoppedOnError.set(true);
                                stopJob(jobId);
                            }
                        });

                    if(flow.getOverrideStepConfig() != null) {
                        stepRunner.withStepConfig(flow.getOverrideStepConfig());
                    }
                    stepResp = stepRunner.run();
                    stepRunner.awaitCompletion();
                }
                catch (Exception e) {
                    stepResp = RunStepResponse.withFlow(flow).withStep(stepNum);
                    stepResp.withJobId(runningJobId);
                    if(stepRunner != null){
                        stepResp.setCounts(successCount.get() + errorCount.get(), successCount.get(), errorCount.get(), (long) Math.ceil((double) successCount.get() / stepRunner.getBatchSize()), (long) Math.ceil((double) errorCount.get() / stepRunner.getBatchSize()));
                    }
                    else {
                        stepResp.setCounts(0, 0, 0, 0, 0);
                    }

                    StringWriter errors = new StringWriter();
                    e.printStackTrace(new PrintWriter(errors));
                    stepResp.withStepOutput(errors.toString());
                    stepResp.withSuccess(false);
                    if(successCount.get() > 0) {
                        stepResp.withStatus(JobStatus.COMPLETED_WITH_ERRORS_PREFIX + stepNum);
                    }
                    else{
                        stepResp.withStatus(JobStatus.FAILED_PREFIX + stepNum);
                    }

                    if(runningFlow.isStopOnError()) {
                        jobStoppedOnError.set(true);
                        stopJob(runningJobId);
                    }
                }
                finally {
                    stepOutputs.put(stepNum, stepResp);
                    if(stepResp != null && !stepResp.isSuccess()) {
                        isJobSuccess.set(false);
                    }
                }
            }

            resp.setStepResponses(stepOutputs);

            final JobStatus jobStatus;
            //Update status of job
            if (isJobCancelled.get()) {
                if(runningFlow.isStopOnError() && jobStoppedOnError.get()){
                    jobStatus = JobStatus.STOP_ON_ERROR;
                }
                else {
                    jobStatus = JobStatus.CANCELED;
                }
            }
            else if (!isJobSuccess.get()) {
                    Collection<RunStepResponse> stepResps = stepOutputs.values();
                    long failedStepCount = stepResps.stream().filter((stepResp)-> stepResp.getStatus()
                        .contains(JobStatus.FAILED_PREFIX)).collect(Collectors.counting());
                    if(failedStepCount == stepResps.size()){
                        jobStatus = JobStatus.FAILED;
                    }
                    else {
                        jobStatus = JobStatus.FINISHED_WITH_ERRORS;
                    }
            }
            else {
                jobStatus = JobStatus.FINISHED;
            }
            resp.setJobStatus(jobStatus.toString());
            try {
                if (flowContext.jobOutputIsEnabled) {
                    flowContext.jobService.finishJob(jobId, jobStatus.toString());
                }
            }
            catch (Exception e) {
                logger.error("Unable to finish job with ID: " + jobId + "; cause: " + e.getMessage());
            }
            finally {
                JsonNode jobNode = null;
                if (flowContext.jobOutputIsEnabled) {
                    try {
                        jobNode = flowContext.jobService.getJob(jobId);
                    } catch (Exception e) {
                        logger.error("Unable to get job document with ID: " + jobId + ": cause: " + e.getMessage());
                    }
                }
                if(jobNode != null) {
                    try {
                        RunFlowResponse jobDoc = new ObjectMapper().treeToValue(jobNode.get("job"), RunFlowResponse.class);
                        copyJobDataToResponse(resp, jobDoc);
                    }
                    catch (Exception e) {
                        logger.error("Unable to copy job data to RunFlowResponse, cause: " + e.getMessage());
                    }
                }

                jobQueue.remove();
                stepsMap.remove(jobId);
                flowMap.remove(jobId);
                flowContextMap.remove(jobId);
                flowResp.remove(runningJobId);
                if (!jobQueue.isEmpty()) {
                    initializeFlow(stepRunnerFactory, jobQueue.peek());
                } else {
                    isRunning.set(false);
                    threadPool.shutdownNow();
                    runningFlow = null;
                }
            }
        }
    }

    public void awaitCompletion() {
        try {
            awaitCompletion(Long.MAX_VALUE, TimeUnit.DAYS);
        }
        catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    public void awaitCompletion(long timeout, TimeUnit unit) throws InterruptedException {
        if (threadPool != null) {
            threadPool.awaitTermination(timeout, unit);
        }
    }

    class CustomPoolExecutor extends ThreadPoolExecutor {
        public CustomPoolExecutor(int corePoolSize, int maximumPoolSize, long keepAliveTime,
                                    TimeUnit unit, BlockingQueue<Runnable> workQueue) {
            super(corePoolSize, maximumPoolSize, keepAliveTime, unit, workQueue);
        }

        @Override
        public void afterExecute(Runnable r, Throwable t) {
            super.afterExecute(r, t);
            // If submit() method is called instead of execute()
            if (t == null && r instanceof Future<?>) {
                try {
                    Object result = ((Future<?>) r).get();
                } catch (CancellationException e) {
                    t = e;
                } catch (ExecutionException e) {
                    t = e.getCause();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            if (t != null) {
                logger.error("Caught error while running FlowRunnerTask: " + t.getMessage());
                FlowRunnerTask flowRunnerTask = (FlowRunnerTask)r;
                //Run the next queued flow if stop-on-error is set or if the step queue is empty
                if (flowRunnerTask.getStepQueue().isEmpty() || runningFlow.isStopOnError()) {
                    jobQueue.remove();
                    if (!jobQueue.isEmpty()) {
                        initializeFlow(flowRunnerTask.stepRunnerFactory, jobQueue.peek());
                    } else {
                        isRunning.set(false);
                        threadPool.shutdownNow();
                    }
                }
                //Run the next step
                else {
                    if (threadPool != null && !threadPool.isTerminating()) {
                        threadPool.execute(new FlowRunnerTask(flowRunnerTask.stepRunnerFactory, runningFlow, runningJobId));
                    }
                }
            }
        }
    }

    //These methods are used by UI.

    public List<String> getQueuedJobIdsFromFlow(String flowName) {
        return flowMap
            .entrySet()
            .stream()
            .filter(entry -> flowName.equals(entry.getValue().getName()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    public RunFlowResponse getJobResponseById(String jobId) {
        return flowResp.get(jobId);
    }

    public boolean isJobRunning() {
        return isRunning.get();
    }

    public String getRunningStepKey() {
        return runningFlow.getSteps().entrySet()
            .stream()
            .filter(entry -> Objects.equals(entry.getValue(), runningStep))
            .map(Map.Entry::getKey)
            .collect(Collectors.joining());

    }

    public Flow getRunningFlow() {
        return this.runningFlow;
    }

    class FlowContext {
        boolean jobOutputIsEnabled = true;
        JobService jobService;

        FlowContext(Flow flow, Map<String, Object> runtimeOptions) {
            calculateJobOutputIsEnabled(flow, runtimeOptions);
        }

        private void calculateJobOutputIsEnabled(Flow flow, Map<String, Object> runtimeOptions) {
            final String optionName = "disableJobOutput";
            if (runtimeOptions != null && runtimeOptions.containsKey(optionName)) {
                this.jobOutputIsEnabled = !Boolean.parseBoolean(runtimeOptions.get(optionName).toString());
            } else {
                JsonNode flowOptions = flow.getOptions();
                if (flowOptions != null && flowOptions.has(optionName)) {
                    this.jobOutputIsEnabled = !flowOptions.get(optionName).asBoolean();
                }
            }
        }
    }
}
