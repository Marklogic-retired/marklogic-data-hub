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
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class FlowRunnerImpl implements FlowRunner{

    @Autowired
    private HubConfigImpl hubConfig;

    @Autowired
    private FlowManager flowManager;

    private AtomicBoolean isRunning;

    private String runningJobId;
    private Step runningStep;
    private Flow runningFlow;

    private StepRunner stepRunner;

    private Map<String, List<String>> stepsMap = new HashMap<>();
    private Map<String, Flow> flowMap = new HashMap<>();
    private Map<String, RunFlowResponse> flowResp = new HashMap<>();
    private ConcurrentLinkedQueue jobQueue = new ConcurrentLinkedQueue();

    private List<FlowStatusListener> flowStatusListeners = new ArrayList<>();

    private ExecutorService threadPool;
    private JobUpdate jobUpdate = new JobUpdate(hubConfig.newJobDbClient());


    public RunFlowResponse runFlow(String flowName, List<String> stepNums) {
        Flow flow = flowManager.getFlow(flowName);

        //Validation of flow, provided steps
        if (flow == null){
            throw new RuntimeException("Flow not found");
        }
        Iterator<String> stepItr = stepNums.iterator();
        while(stepItr.hasNext()) {
            Step tmpStep = flow.getStep(stepItr.next());
            if(tmpStep == null){
                throw new RuntimeException("Step not found");
            }
        }

        String jobId = UUID.randomUUID().toString();
        RunFlowResponse response = new RunFlowResponse(jobId);

        //Put response, steps and flow in maps with jobId as key
        flowResp.put(jobId, response);
        stepsMap.put(jobId, stepNums);
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
            RunFlowResponse resp = flowResp.get(runningJobId);
            resp.setStepResponses(stepOutputs);

            stepRunner.stop();
            jobUpdate.postJobs(jobId, JobStatus.CANCELED.toString(), runningStep.getName());
            if(jobQueue.isEmpty()) {
                threadPool.shutdown();
                isRunning.set(false);
            }
            else {
                initializeFlow((String) jobQueue.peek());
            }
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
            List<String> stepList = stepsMap.get(jobQueue.peek());
            Iterator<String> itr = stepList.iterator();
            AtomicInteger errorCount = new AtomicInteger();
            Map<String, Job> stepOutputs = new HashMap<>();
            while ((itr.hasNext())){
                String stepNum = itr.next();
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
            else {
                jobUpdate.postJobs(jobId, JobStatus.FINISHED.toString(), runningStep.getName());
            }
            resp.setStepResponses(stepOutputs);
            resp.setEndTime(Calendar.getInstance());
            jobQueue.remove(jobQueue.peek());
            if(!jobQueue.isEmpty()) {
                initializeFlow((String) jobQueue.peek());
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
