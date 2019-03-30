package com.marklogic.hub.flow.impl;

import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowStatusListener;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.job.Job;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.job.JobUpdate;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.step.StepRunner;
import com.marklogic.hub.step.StepRunnerFactory;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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

    private String runningJobId;
    private Step runningStep;
    private Flow runningFlow;

    private StepRunner stepRunner;

    private Map<String, Queue<String>> stepsMap = new ConcurrentHashMap<>();
    private Map<String, Flow> flowMap = new ConcurrentHashMap<>();
    private Map<String, RunFlowResponse> flowResp = new ConcurrentHashMap<>();
    private Queue<String> jobQueue = new ConcurrentLinkedQueue<>();

    private List<FlowStatusListener> flowStatusListeners = new ArrayList<>();
    static final SimpleDateFormat DATE_TIME_FORMAT = new SimpleDateFormat("yyyy-mm-dd hh:mm:ss");

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
            resp.setStartTime(DATE_TIME_FORMAT.format(new Date()));
            Queue<String> stepQueue = stepsMap.get(jobQueue.peek());

            Map<String, Job> stepOutputs = new HashMap<>();
            while (! stepQueue.isEmpty()){
                String stepNum = stepQueue.poll();
                runningStep = runningFlow.getSteps().get(stepNum);

                //now we check and validate we have no nulls
                if(StringUtils.isEmpty(runningStep.getDestinationDatabase())) {
                    runningStep.setDestinationDatabase(hubConfig.getDbName(DatabaseKind.FINAL));
                }
                if(StringUtils.isEmpty(runningStep.getSourceDatabase())) {
                    runningStep.setSourceDatabase(hubConfig.getDbName(DatabaseKind.STAGING));
                }
                Map<String, Object> optsMap = new HashMap<>(flow.getOverrideOptions());
                AtomicLong errorCount = new AtomicLong();
                AtomicLong successCount = new AtomicLong();

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
                    .onStatusChanged((jobId, percentComplete, message) ->{
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChanged(jobId, runningStep, percentComplete, runningStep.getName() + " " + message);
                        });
                    });
                //If step doc doesn't have batchnum and thread count specified, fallback to flow's values.
                Map<String,Step> steps = runningFlow.getSteps();
                Step step = steps.get(stepNum);
                //default batch size
                int stepBatchSize = 100;
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
                /*  If an exception occurs in step execution, we don't want the thread to die and affect other step execution.
                    If an exception occurs, the exception message is written to job output
                 */
                Job stepResp = null;
                try {
                    stepResp = stepRunner.run();
                    stepRunner.awaitCompletion();
                }
                catch (Exception e) {
                    stepResp.setCounts(successCount.get() + errorCount.get()  , successCount.get(), errorCount.get()  , (long)Math.ceil((double)successCount.get()/stepBatchSize), (long)Math.ceil((double)errorCount.get()/stepBatchSize));
                    stepResp.withJobOutput(e.getMessage());
                    stepResp.withSuccess(false);
                    stepResp.withStatus(JobStatus.COMPLETED_WITH_ERRORS_PREFIX + stepNum);
                }
                stepOutputs.put(stepNum, stepResp);
                if(! stepResp.isSuccess()) {
                    isJobSuccess.set(false);
                }
            }
            try {
                if (!isJobSuccess.get()) {
                    jobUpdate.postJobs(jobId, JobStatus.FINISHED_WITH_ERRORS.toString(), runningStep.getName());
                } else if (isJobCancelled.get()) {
                    jobUpdate.postJobs(jobId, JobStatus.CANCELED.toString(), runningStep.getName());
                } else {
                    jobUpdate.postJobs(jobId, JobStatus.FINISHED.toString(), runningStep.getName());
                }
            }
            catch (Exception e) {
                throw e;
            }
            resp.setStepResponses(stepOutputs);
            resp.setEndTime(DATE_TIME_FORMAT.format(new Date()));
            jobQueue.remove();
            if(!jobQueue.isEmpty()) {
                initializeFlow((String) jobQueue.peek());
            }
            else {
                threadPool.shutdownNow();
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

    //This method is for UI. We can expose them in interface if required

    public List<String> getQueuedJobIdsFromFlow(String flowName) {
        return flowMap
            .entrySet()
            .stream()
            .filter(entry -> flowName.equals(entry.getValue().getName()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }
}
