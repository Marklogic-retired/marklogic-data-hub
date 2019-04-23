package com.marklogic.hub.flow.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowStatusListener;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.job.JobUpdate;
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
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Component
public class FlowRunnerImpl implements FlowRunner{

    @Autowired
    private HubConfigImpl hubConfig;

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private StepRunnerFactory stepRunnerFactory;

    private AtomicBoolean isRunning = new AtomicBoolean(false);
    private AtomicBoolean isJobCancelled = new AtomicBoolean(false);
    private AtomicBoolean isJobSuccess = new AtomicBoolean(true);
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    private String runningJobId;
    private Step runningStep;
    private Flow runningFlow;

    private StepRunner stepRunner;

    private Map<String, Queue<String>> stepsMap = new ConcurrentHashMap<>();
    private Map<String, Flow> flowMap = new ConcurrentHashMap<>();
    private Map<String, RunFlowResponse> flowResp = new ConcurrentHashMap<>();
    private Queue<String> jobQueue = new ConcurrentLinkedQueue<>();

    private List<FlowStatusListener> flowStatusListeners = new ArrayList<>();
    static final SimpleDateFormat DATE_TIME_FORMAT = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");

    private ThreadPoolExecutor threadPool;
    private JobUpdate jobUpdate;

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

        //Validation of flow, provided steps
        if (flow == null){
            throw new RuntimeException("Flow " + flowName + " not found");
        }

        if(stepNums == null) {
            stepNums = new ArrayList<String>(flow.getSteps().keySet());
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
        isRunning.set(true);
        isJobSuccess.set(true);
        runningJobId = jobId;
        runningFlow = flowMap.get(runningJobId);
        if(jobUpdate == null) {
            jobUpdate = new JobUpdate(hubConfig.newJobDbClient());
        }
        if(threadPool == null || threadPool.isTerminated()) {
            threadPool = new CustomPoolExecutor(1, 1, 0L, TimeUnit.MILLISECONDS
                , new LinkedBlockingQueue<Runnable>());
        }
        threadPool.execute(new FlowRunnerTask(runningFlow, runningJobId));
    }
    //TODO : fix cancel/stop on error status
    public void stopJob(String jobId) {
        if(stepsMap.get(jobId) != null){
            stepsMap.get(jobId).clear();
            stepsMap.remove(jobId);
            isJobCancelled.set(true);
        }
        else {
            throw new RuntimeException("Job not running");
        }
        if (jobId.equals(runningJobId)) {
            if(stepRunner != null){
                stepRunner.stop();
            }
        }
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
            if(StringUtils.isEmpty(resp.getStartTime())) {
                resp.setStartTime(DATE_TIME_FORMAT.format(new Date()));
            }
            stepQueue = stepsMap.get(jobId);

            Map<String, RunStepResponse> stepOutputs = new HashMap<>();
            String stepNum = null;

            final long[] currSuccessfulEvents = {0};
            final long[] currFailedEvents = {0};
            final int[] currPercentComplete = {0};
            while (! stepQueue.isEmpty()) {
                stepNum = stepQueue.poll();
                runningStep = runningFlow.getSteps().get(stepNum);
                Map<String, Object> optsMap = new HashMap<>(flow.getOverrideOptions());
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
                    //If step doc doesn't have batchnum and thread count specified, fallback to flow's values.
                    Map<String,Step> steps = runningFlow.getSteps();
                    Step step = steps.get(stepNum);

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
                    stepResp.setStepEndTime(DATE_TIME_FORMAT.format(new Date()));
                    RunStepResponse finalStepResp = stepResp;
                    try {
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChanged(jobId, runningStep, JobStatus.FAILED.toString(), currPercentComplete[0], currSuccessfulEvents[0], currFailedEvents[0],
                                runningStep.getName() + " " + Arrays.toString(finalStepResp.stepOutput.toArray()));
                        });
                    } catch (Exception ex) {
                        logger.error(ex.getMessage());
                    }
                }
                finally {
                    stepOutputs.put(stepNum, stepResp);
                    if(! stepResp.isSuccess()) {
                        isJobSuccess.set(false);
                    }
                    if(runningFlow.isStopOnError()) {
                        stopJob(runningJobId);
                    }
                }
            }

            resp.setStepResponses(stepOutputs);
            resp.setEndTime(DATE_TIME_FORMAT.format(new Date()));

            final String jobStatus;
            //Update status of job
            if (isJobCancelled.get()) {
                jobStatus = JobStatus.CANCELED.toString();
            }
            else if (!isJobSuccess.get()) {
                if(runningFlow.isStopOnError()){
                    jobStatus = JobStatus.STOP_ON_ERROR.toString();
                }
                else{
                    Collection<RunStepResponse> stepResps = stepOutputs.values();
                    long failedStepCount = stepResps.stream().filter((stepResp)-> stepResp.getStatus()
                        .contains(JobStatus.FAILED_PREFIX)).collect(Collectors.counting());
                    if(failedStepCount == stepResps.size()){
                        jobStatus = JobStatus.FAILED.toString();
                    }
                    else {
                        jobStatus = JobStatus.FINISHED_WITH_ERRORS.toString();
                    }
                }
            }
            else {
                jobStatus = JobStatus.FINISHED.toString();
            }
            resp.setJobStatus(jobStatus);

            Map.Entry<String, RunStepResponse> firstStepResponse = stepOutputs.entrySet().iterator().next();
            String firstKey = null;
            RunStepResponse firstValue = null;
            if(firstStepResponse != null) {
                firstKey = firstStepResponse.getKey();
                firstValue = firstStepResponse.getValue();
            }

            //If only one step is run and it failed before creating a job doc, a job doc is created
            try{
                JsonNode jsonResp = jobUpdate.getJobs(runningJobId);
                //Temporarily set first step start time == job start time (job doc created in server, step resp in client)
                String startTime = null;
                if(jsonResp != null ){
                    startTime = jsonResp.get("job").get("timeStarted").textValue();    
                }
                if(firstValue != null) {
                    firstValue.setStepStartTime(startTime);
                }
            }
            catch(ResourceNotFoundException e) {
                if(firstValue != null) {
                    firstValue.setStepStartTime(DATE_TIME_FORMAT.format(new Date()));
                }
                jobUpdate.postJobs(jobId,flow.getName());
                //Set end time as well else start time > end time
                if(firstValue != null) {
                    firstValue.setStepEndTime(DATE_TIME_FORMAT.format(new Date()));
                }
            }

            //Set the first step output
            if(firstStepResponse != null) {
                stepOutputs.put(firstKey, firstValue);
            }
            try {
                jobUpdate.postJobs(jobId, jobStatus, stepNum, stepOutputs);
            }
            catch (Exception e) {
                throw e;
            }
            finally {
                if (!isJobSuccess.get()) {
                    try {
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChanged(jobId, runningStep, jobStatus, currPercentComplete[0], currSuccessfulEvents[0], currFailedEvents[0], JobStatus.FAILED.toString());
                        });
                    } catch (Exception ex) {
                        logger.error(ex.getMessage());
                    }
                } else {
                    try {
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChanged(jobId, runningStep, jobStatus, currPercentComplete[0], currSuccessfulEvents[0], currFailedEvents[0], JobStatus.FINISHED.toString());
                        });
                    } catch (Exception ex) {
                        logger.error(ex.getMessage());
                    }
                }
                jobQueue.remove();
                if (!jobQueue.isEmpty()) {
                    initializeFlow((String) jobQueue.peek());
                } else {
                    isRunning.set(false);
                    threadPool.shutdownNow();
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
                if(((FlowRunnerTask)r).getStepQueue().isEmpty() || runningFlow.isStopOnError()) {
                    jobQueue.remove();
                    if (!jobQueue.isEmpty()) {
                        initializeFlow((String) jobQueue.peek());
                    } else {
                        isRunning.set(false);
                        threadPool.shutdownNow();
                    }
                }
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
}
