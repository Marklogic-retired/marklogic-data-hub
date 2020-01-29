package com.marklogic.hub.flow.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowStatusListener;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.job.JobDocManager;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.MarkLogicStepDefinitionProvider;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Queue;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CancellationException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Component
public class FlowRunnerImpl implements FlowRunner{

    @Autowired
    private HubConfig hubConfig;

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private StepRunnerFactory stepRunnerFactory;

    private AtomicBoolean isRunning = new AtomicBoolean(false);
    private AtomicBoolean isJobCancelled = new AtomicBoolean(false);
    private AtomicBoolean isJobSuccess = new AtomicBoolean(true);
    private AtomicBoolean jobStoppedOnError = new AtomicBoolean(false);
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    private String runningJobId;
    private Step runningStep;
    private Flow runningFlow;

    private StepRunner stepRunner;

    private final Map<String, Queue<String>> stepsMap = new ConcurrentHashMap<>();
    private Map<String, Flow> flowMap = new ConcurrentHashMap<>();
    private Map<String, RunFlowResponse> flowResp = new ConcurrentHashMap<>();
    private Queue<String> jobQueue = new ConcurrentLinkedQueue<>();

    private List<FlowStatusListener> flowStatusListeners = new ArrayList<>();

    private ThreadPoolExecutor threadPool;
    private JobDocManager jobDocManager;
    private boolean disableJobOutput = false;

    public FlowRunnerImpl() {
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
        this(new HubConfigImpl(host, username, password));
    }

    /**
     * Constructs a FlowRunnerImpl that can be used for running flows without any reference to project files on a
     * filesystem - and thus, this constructor will not instantiate an instance of FlowManager, which is used for reading
     * project files from the filesystem.
     *
     * This constructor handles ensuring that step definitions are retrieved from MarkLogic as opposed to from the
     * filesystem. It is expected that the "runFlowWithoutProject" method will then be used, which ensures that flow
     * artifacts are also retrieved from MarkLogic as opposed to from the filesystem.
     *
     * @param hubConfig
     */
    public FlowRunnerImpl(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.stepRunnerFactory = new StepRunnerFactory(this.hubConfig);
        this.stepRunnerFactory.setStepDefinitionProvider(new MarkLogicStepDefinitionProvider(this.hubConfig.newStagingClient(null)));
    }

    @Override
    public FlowRunner onStatusChanged(FlowStatusListener listener) {
        this.flowStatusListeners.add(listener);
        return this;
    }

    public RunFlowResponse runFlow(String flowName) {
        return runFlow(flowName, null, null, new HashMap<>(), new HashMap<>());
    }

    public RunFlowResponse runFlow(String flowName, List<String> stepNums) {
        return runFlow(flowName, stepNums, null, new HashMap<>(), new HashMap<>());
    }

    public RunFlowResponse runFlow(String flowName, String jobId) {
        return runFlow(flowName, null, jobId, new HashMap<>(), new HashMap<>());
    }

    public RunFlowResponse runFlow(String flowName, List<String> stepNums, String jobId) {
        return runFlow(flowName, stepNums, jobId, new HashMap<>(), new HashMap<>());
    }

    public RunFlowResponse runFlow(String flowName, String jobId, Map<String, Object> options) {
        return runFlow(flowName, null, jobId, options, new HashMap<>());
    }

    public RunFlowResponse runFlow(String flowName, List<String> stepNums,  String jobId, Map<String, Object> options) {
        return runFlow(flowName, stepNums, jobId, options, new HashMap<>());
    }

    public RunFlowResponse runFlow(String flowName, List<String> stepNums, String jobId, Map<String, Object> options, Map<String, Object> stepConfig) {
        Flow flow = flowManager.getFlow(flowName);
        if (flow == null) {
            throw new RuntimeException("Flow " + flowName + " not found");
        }
        return runFlow(flow, stepNums, jobId, options, stepConfig);
    }

    /**
     * Retrieves the given flow from the staging database in MarkLogic, and then proceeds with the normal execution of
     * the flow.
     *
     * @param flowInputs
     * @return
     */
    @Override
    public RunFlowResponse runFlowWithoutProject(FlowInputs flowInputs) {
        final String flowName = flowInputs.getFlowName();
        if (StringUtils.isEmpty(flowName)) {
            throw new IllegalArgumentException("Cannot run flow; no flow name provided");
        }
        Flow flow;
        try {
            JsonNode jsonFlow = hubConfig.newStagingClient().newJSONDocumentManager().read("/flows/" + flowName + ".flow.json", new JacksonHandle()).get();
            flow = new FlowImpl().deserialize(jsonFlow);
        } catch (Exception ex) {
            throw new RuntimeException("Unable to retrieve flow with name: " + flowInputs.getFlowName() + ": cause: " + ex.getMessage());
        }
        return runFlow(flow, flowInputs.getSteps(), flowInputs.getJobId(), flowInputs.getOptions(), flowInputs.getStepConfig());
    }

    public RunFlowResponse runFlow(Flow flow, List<String> stepNums, String jobId, Map<String, Object> options, Map<String, Object> stepConfig) {
        if (options != null && options.containsKey("disableJobOutput")) {
            disableJobOutput = Boolean.parseBoolean(options.get("disableJobOutput").toString());
        } else {
            disableJobOutput = false;
        }

        if(stepNums == null) {
            stepNums = new ArrayList<>(flow.getSteps().keySet());
        }

        if(stepConfig != null && !stepConfig.isEmpty()) {
            flow.setOverrideStepConfig(stepConfig);
        }

        flow.setOverrideOptions(options);

        Iterator<String> stepItr = stepNums.iterator();
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

        //Put response, steps and flow in maps with jobId as key
        flowResp.put(jobId, response);
        stepsMap.put(jobId, stepsQueue);
        flowMap.put(jobId, flow);

        //add jobId to a queue
        jobQueue.add(jobId);
        if(!isRunning.get()){
            initializeFlow(jobId);
        }
        return response;
    }

    private void initializeFlow(String jobId) {
        //Reset the states to initial values before starting a flow run
        isRunning.set(true);
        isJobSuccess.set(true);
        isJobCancelled.set(false);
        jobStoppedOnError.set(false);
        runningJobId = jobId;
        runningFlow = flowMap.get(runningJobId);
        if(jobDocManager == null && !disableJobOutput) {
            jobDocManager = new JobDocManager(hubConfig.newJobDbClient());
        }
        if(threadPool == null || threadPool.isTerminated()) {
            // thread pool size needs to be at least 2, so the current step thread can kick-off the next step thread
            int maxPoolSize = Math.max(Runtime.getRuntime().availableProcessors()/2, 2);
            threadPool = new CustomPoolExecutor(2, maxPoolSize, 0L, TimeUnit.MILLISECONDS
                , new LinkedBlockingQueue<Runnable>());
        }
        threadPool.execute(new FlowRunnerTask(runningFlow, runningJobId));
    }

    public void stopJob(String jobId) {
        synchronized (stepsMap) {
            if(stepsMap.get(jobId) != null){
                stepsMap.get(jobId).clear();
                stepsMap.remove(jobId);
                isJobCancelled.set(true);
            }
            else {
                throw new RuntimeException("Job not running");
            }
        }
        if (jobId.equals(runningJobId)) {
            if(stepRunner != null){
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
        private String jobId;
        private Flow flow;
        private Queue<String> stepQueue;

        public Queue<String> getStepQueue() {
            return stepQueue;
        }

        FlowRunnerTask(Flow flow, String jobId) {
            this.jobId = jobId;
            this.flow = flow;
        }

        FlowRunnerTask(Flow flow, String jobId, Queue<String> stepQueue) {
            this.jobId = jobId;
            this.flow = flow;
            this.stepQueue = stepQueue;
        }

        @Override
        public void run() {
            RunFlowResponse resp = flowResp.get(runningJobId);
            resp.setFlowName(runningFlow.getName());
            stepQueue = stepsMap.get(jobId);

            Map<String, RunStepResponse> stepOutputs = new HashMap<>();
            String stepNum = null;

            final long[] currSuccessfulEvents = {0};
            final long[] currFailedEvents = {0};
            final int[] currPercentComplete = {0};
            while (! stepQueue.isEmpty()) {
                stepNum = stepQueue.poll();
                runningStep = runningFlow.getSteps().get(stepNum);
                Map<String, Object> optsMap ;
                if(flow.getOverrideOptions() != null) {
                    optsMap = new HashMap<>(flow.getOverrideOptions());
                }
                else {
                    optsMap = new HashMap<>();
                }

                AtomicLong errorCount = new AtomicLong();
                AtomicLong successCount = new AtomicLong();
                /*  If an exception occurs in step execution, we don't want the thread to die and affect other step execution.
                    If an exception occurs, the exception message is written to job output
                 */
                RunStepResponse stepResp = null;
                //Initializing stepBatchSize to default flow batch size

                try {
                    stepRunner = stepRunnerFactory.getStepRunner(runningFlow, stepNum)
                        .withJobId(jobId)
                        .withOptions(optsMap)
                        .onItemComplete((jobID, itemID) -> {
                            successCount.incrementAndGet();
                        })
                        .onItemFailed((jobId, itemId)-> {
                            errorCount.incrementAndGet();
                            if(flow.isStopOnError()){
                                jobStoppedOnError.set(true);
                                stopJob(jobId);
                            }
                        })
                        .onStatusChanged((jobId, percentComplete, jobStatus, successfulEvents, failedEvents, message) ->{
                            flowStatusListeners.forEach((FlowStatusListener listener) -> {
                                currSuccessfulEvents[0] = successfulEvents;
                                currFailedEvents[0] = failedEvents;
                                currPercentComplete[0] = percentComplete;
                                listener.onStatusChanged(jobId, runningStep, jobStatus, percentComplete, successfulEvents, failedEvents, runningStep.getName() + " : " + message);
                            });
                        });

                    //If property values are overriden in UI, use those values over any other.
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
                    if (!disableJobOutput) {
                        try {
                            jobDocManager.postJobs(jobId, JobStatus.FAILED_PREFIX + stepNum, stepNum, null, stepResp);
                        } catch (Exception ex) {
                            logger.error(ex.getMessage());
                        }
                    }
                    RunStepResponse finalStepResp = stepResp;
                    try {
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChanged(jobId, runningStep, JobStatus.FAILED.toString(), currPercentComplete[0], currSuccessfulEvents[0], currFailedEvents[0],
                                runningStep.getName() + " " + Arrays.toString(finalStepResp.stepOutput.toArray()));
                        });
                    } catch (Exception ex) {
                        logger.error(ex.getMessage());
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
                if (!disableJobOutput) {
                    jobDocManager.updateJobStatus(jobId, jobStatus);
                }
            }
            catch (Exception e) {
                logger.error(e.getMessage());
            }
            finally {
                JsonNode jobNode = null;
                if (!disableJobOutput) {
                    try {
                        jobNode = jobDocManager.getJobDocument(jobId);
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

                if (!isJobSuccess.get()) {
                    try {
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChanged(jobId, runningStep, jobStatus.toString(), currPercentComplete[0], currSuccessfulEvents[0], currFailedEvents[0], JobStatus.FAILED.toString());
                        });
                    } catch (Exception ex) {
                        logger.error(ex.getMessage());
                    }
                } else {
                    try {
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChanged(jobId, runningStep, jobStatus.toString(), currPercentComplete[0], currSuccessfulEvents[0], currFailedEvents[0], JobStatus.FINISHED.toString());
                        });
                    } catch (Exception ex) {
                        logger.error(ex.getMessage());
                    }
                }

                jobQueue.remove();
                stepsMap.remove(jobId);
                flowMap.remove(jobId);
                flowResp.remove(runningJobId);
                if (!jobQueue.isEmpty()) {
                    initializeFlow((String) jobQueue.peek());
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
                logger.error(t.getMessage());
                //Run the next queued flow if stop-on-error is set or if the step queue is empty
                if(((FlowRunnerTask)r).getStepQueue().isEmpty() || runningFlow.isStopOnError()) {
                    jobQueue.remove();
                    if (!jobQueue.isEmpty()) {
                        initializeFlow((String) jobQueue.peek());
                    } else {
                        isRunning.set(false);
                        threadPool.shutdownNow();
                    }
                }
                //Run the next step
                else {
                    if(!(threadPool != null && threadPool.isTerminating())) {
                        threadPool.execute(new FlowRunnerTask(runningFlow, runningJobId,((FlowRunnerTask)r).getStepQueue()));
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

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    public void setStepRunnerFactory(StepRunnerFactory stepRunnerFactory) {
        this.stepRunnerFactory = stepRunnerFactory;
    }

    public void setFlowManager(FlowManager flowManager) {
        this.flowManager = flowManager;
    }

    public HubConfig getHubConfig() {
        return hubConfig;
    }
}
