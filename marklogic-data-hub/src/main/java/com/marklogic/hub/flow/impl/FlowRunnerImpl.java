package com.marklogic.hub.flow.impl;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class FlowRunnerImpl implements FlowRunner{

    @Autowired
    private HubConfigImpl hubConfig;

    @Autowired
    private FlowManager flowManager;

    private AtomicBoolean isRunning;
    private AtomicBoolean isJobCancelled;

    private String runningJobId;
    private Step runningStep;
    private Flow runningFlow;

    private StepRunner stepRunner;

    private Map<String, Queue<String>> stepsMap = new ConcurrentHashMap<>();
    private Map<String, Flow> flowMap = new ConcurrentHashMap<>();
    private Map<String, RunFlowResponse> flowResp = new ConcurrentHashMap<>();
    private Queue<String> jobQueue = new ConcurrentLinkedQueue();

    private List<FlowStatusListener> flowStatusListeners = new ArrayList<>();

    private ExecutorService threadPool;
    private JobUpdate jobUpdate = new JobUpdate(hubConfig.newJobDbClient());

    public RunFlowResponse runFlow(String flowName) {
        Flow flow = flowManager.getFlow(flowName);
        if (flow == null){
            throw new RuntimeException("Flow " + flowName + " not found");
        }
        List<String> steps = new ArrayList<String>(flow.getSteps().keySet());
        return runFlow(flowName, steps);
    }

    public RunFlowResponse runFlow(String flowName, List<String> stepNums) {
        Flow flow = flowManager.getFlow(flowName);

        //Validation of flow, provided steps
        if (flow == null){
            throw new RuntimeException("Flow " + flowName + " not found");
        }
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

        String jobId = UUID.randomUUID().toString();
        RunFlowResponse response = new RunFlowResponse(jobId);

        //Put response, steps and flow in maps with jobId as key
        flowResp.put(jobId, response);
        stepsMap.put(jobId, stepsQueue);
        flowMap.put(jobId, flow);

        //add jobId to a queue
        jobQueue.add(jobId);

        if(! isRunning.get()){
            initializeFlow(jobId);
        }
        return response;
    }

    private void initializeFlow(String jobId) {
        isRunning.set(true);
        runningJobId = jobId;
        runningFlow = flowMap.get(runningJobId);
        if(threadPool == null || threadPool.isTerminated()) {
            threadPool = Executors.newFixedThreadPool(1);
        }
        threadPool.submit(new FlowRunnerTask(runningFlow, runningJobId));
    }

    public void stopJob(String jobId) {
        if (jobId.equals(runningJobId)) {
            stepsMap.get(jobId).clear();
            isJobCancelled.set(true);
            stepRunner.stop();
        }
    }

    private class FlowRunnerTask implements Runnable {
        private String jobId;
        private Flow flow;

        public FlowRunnerTask(Flow flow, String jobId) {
            this.jobId = jobId;
            this.flow = flow;
        }

        @Override
        public void run() {
            RunFlowResponse resp = flowResp.get(runningJobId);
            resp.setStartTime(Calendar.getInstance());
            Queue<String> stepQueue = stepsMap.get(jobQueue.peek());

            AtomicInteger errorCount = new AtomicInteger();
            Map<String, Job> stepOutputs = new HashMap<>();
            while (! stepQueue.isEmpty()){
                String stepNum = stepQueue.poll();
                runningStep = runningFlow.getSteps().get(stepNum);
                stepRunner = new StepRunnerFactory().getStepRunner(runningFlow, stepNum)
                    .withJobId(jobId)
                    .onItemFailed((jobId, itemId)-> {
                        errorCount.incrementAndGet();
                        if(flow.isStopOnError()){
                            stopJob(jobId);
                        }
                    })
                    .onStatusChanged((jobId, percentComplete, message) ->{
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChange(jobId, runningStep, percentComplete, runningStep.getName() + " " + message);
                        });
                    });
                Job stepResp = stepRunner.run();
                stepOutputs.put(stepNum, stepResp);
                stepRunner.awaitCompletion();
            }
            if(errorCount.get() > 0){
                jobUpdate.postJobs(jobId, JobStatus.FINISHED_WITH_ERRORS.toString(), runningStep.getName());
            }
            else if(isJobCancelled.get()) {
                jobUpdate.postJobs(jobId, JobStatus.CANCELED.toString(), runningStep.getName());
            }
            else {
                jobUpdate.postJobs(jobId, JobStatus.FINISHED.toString(), runningStep.getName());
            }
            resp.setStepResponses(stepOutputs);
            resp.setEndTime(Calendar.getInstance());
            jobQueue.remove(jobQueue.peek());
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
        }
    }

    public void awaitCompletion(long timeout, TimeUnit unit) throws InterruptedException {
        if (threadPool != null) {
            threadPool.awaitTermination(timeout, unit);
        }
    }
}
