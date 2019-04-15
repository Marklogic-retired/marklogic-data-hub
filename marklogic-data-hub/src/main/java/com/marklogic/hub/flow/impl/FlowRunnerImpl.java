package com.marklogic.hub.flow.impl;

import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowStatusListener;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.job.Job;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.job.JobUpdate;
import com.marklogic.hub.step.StepRunner;
import com.marklogic.hub.step.StepRunnerFactory;
import com.marklogic.hub.step.impl.Step;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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

    private ExecutorService threadPool;
    private JobUpdate jobUpdate;

    @Override
    public FlowRunner onStatusChanged(FlowStatusListener listener) {
        this.flowStatusListeners.add(listener);
        return this;
    }

    public RunFlowResponse runFlow(String flowName) {
        return runFlow(flowName, null, null, new HashMap<>(), null, null, null, null);
    }

    public RunFlowResponse runFlow(String flowName, List<String> stepNums) {
        return runFlow(flowName, stepNums, null, new HashMap<>(), null, null, null, null);
    }

    public RunFlowResponse runFlow(String flowName, String jobId) {
        return runFlow(flowName, null, jobId, new HashMap<>(), null, null, null, null);
    }

    public RunFlowResponse runFlow(String flowName, List<String> stepNums, String jobId) {
        return runFlow(flowName, stepNums, jobId, new HashMap<>(), null, null, null, null);
    }

    public RunFlowResponse runFlow(String flowName, String jobId, Map<String, Object> options) {
        return runFlow(flowName, null, jobId, options, null, null, null, null);
    }

    public RunFlowResponse runFlow(String flowName, List<String> stepNums, String jobId, Map<String, Object> options) {
        return runFlow(flowName, stepNums, jobId, options, null, null, null, null);
    }

    public RunFlowResponse runFlow(String flowName, List<String> stepNums, String jobId, Map<String, Object> options, Integer batchSize, Integer threadCount, String sourceDB, String destDB) {

        Flow flow = flowManager.getFlow(flowName);

        //Validation of flow, provided steps
        if (flow == null){
            throw new RuntimeException("Flow " + flowName + " not found");
        }

        if(stepNums == null) {
            stepNums = new ArrayList<String>(flow.getSteps().keySet());
        }

        if(StringUtils.isNotEmpty(destDB)){
            flow.setOverrideDestDB(destDB);
        }

        if(StringUtils.isNotEmpty(sourceDB)){
            flow.setOverrideSourceDB(sourceDB);
        }

        if(threadCount != null){
            flow.setOverrideThreadCount(threadCount);
        }

        if(batchSize != null){
            flow.setOverrideBatchSize(batchSize);
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
            threadPool = Executors.newFixedThreadPool(1);
        }
        threadPool.submit(new FlowRunnerTask(runningFlow, runningJobId));
    }

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
            stepRunner.stop();
        }
    }

    private class FlowRunnerTask implements Runnable {
        private String jobId;
        private Flow flow;

        FlowRunnerTask(Flow flow, String jobId) {
            this.jobId = jobId;
            this.flow = flow;
        }

        @Override
        public void run() {
            RunFlowResponse resp = flowResp.get(runningJobId);
            resp.setFlowName(runningFlow.getName());
            resp.setStartTime(DATE_TIME_FORMAT.format(new Date()));
            Queue<String> stepQueue = stepsMap.get(jobQueue.peek());

            Map<String, Job> stepOutputs = new HashMap<>();
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
                Job stepResp = null;
                //Initializing stepBatchSize to default flow batch size
                int stepBatchSize = 100;
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

                    if(step.getThreadCount() == 0){
                        stepRunner.withThreadCount(flow.getThreadCount());
                    }
                    if(step.getBatchSize() == 0) {
                        stepBatchSize = flow.getBatchSize();
                        stepRunner.withBatchSize(stepBatchSize);
                    }
                    //If property values are overriden in UI, use those values over any other.
                    if(flow.getOverrideBatchSize() != null) {
                        stepBatchSize = flow.getOverrideBatchSize();
                        stepRunner.withBatchSize(stepBatchSize);
                    }
                    if(flow.getOverrideThreadCount() != null) {
                        stepRunner.withThreadCount(flow.getOverrideThreadCount());
                    }
                    if(flow.getOverrideSourceDB() != null){
                        stepRunner.withSourceClient(hubConfig.newStagingClient(flow.getOverrideSourceDB()));
                    }
                    if(flow.getOverrideDestDB() != null){
                        stepRunner.withDestinationDatabase(flow.getOverrideDestDB());
                    }
                    stepResp = stepRunner.run();
                    stepRunner.awaitCompletion();
                }
                catch (Exception e) {
                    stepResp = Job.withFlow(flow);
                    stepResp.withJobId(runningJobId);
                    stepResp.setCounts(successCount.get() + errorCount.get(), successCount.get(), errorCount.get(), (long) Math.ceil((double) successCount.get() / stepBatchSize), (long) Math.ceil((double) errorCount.get() / stepBatchSize));
                    stepResp.withStepOutput(e.getLocalizedMessage());
                    stepResp.withSuccess(false);
                    if(successCount.get() > 0) {
                        stepResp.withStatus(JobStatus.COMPLETED_WITH_ERRORS_PREFIX + stepNum);
                    }
                    else{
                        stepResp.withStatus(JobStatus.FAILED_PREFIX + stepNum);
                    }
                    Job finalStepResp = stepResp;
                    try {
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChanged(jobId, runningStep, JobStatus.FAILED.toString(), currPercentComplete[0], currSuccessfulEvents[0], currFailedEvents[0],
                                runningStep.getName() + " " + Arrays.toString(finalStepResp.stepOutput.toArray()));
                        });
                    } catch (Exception ex) {
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

            String jobStatus = null;
            //Update status of job
            if (!isJobSuccess.get()) {
                if(runningFlow.isStopOnError()){
                    jobStatus = JobStatus.STOP_ON_ERROR.toString();
                }
                else{
                    jobStatus = JobStatus.FINISHED_WITH_ERRORS.toString();
                }
            } else if (isJobCancelled.get()) {
                jobStatus = JobStatus.CANCELED.toString();
            } else {
                jobStatus = JobStatus.FINISHED.toString();
            }
            //If only one step is run and it failed before creating a job doc, a job doc is created
            try{
                jobUpdate.getJobs(jobId);
            }
            catch(ResourceNotFoundException e) {
                jobUpdate.postJobs(jobId,flow.getName());
            }
            try {
                jobUpdate.postJobs(jobId, jobStatus, stepNum, stepOutputs);
                resp.setJobStatus(jobStatus);
            }
            catch (Exception e) {
                throw e;
            }
            finally {
                if (!isJobSuccess.get()) {
                    try {
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChanged(jobId, runningStep, JobStatus.FINISHED_WITH_ERRORS.toString(), currPercentComplete[0], currSuccessfulEvents[0], currFailedEvents[0], JobStatus.FAILED.toString());
                        });
                    } catch (Exception ex) {
                    }
                } else {
                    try {
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChanged(jobId, runningStep, JobStatus.FINISHED.toString(), currPercentComplete[0], currSuccessfulEvents[0], currFailedEvents[0], JobStatus.FINISHED.toString());
                        });
                    } catch (Exception ex) {
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
        return this.stepRunner.getRunningStepKey();
    }
}
