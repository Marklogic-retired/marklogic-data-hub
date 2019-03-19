package com.marklogic.hub.flow.impl;

import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowStatusListener;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
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

@Component
public class FlowRunnerImpl implements FlowRunner{

    @Autowired
    private HubConfigImpl hubConfig;

    @Autowired
    private FlowManagerImpl flowManager;

    private AtomicBoolean isRunning;

    private String runningJobId;
    private Step runningStep;
    private Flow runningFlow;

    private StepRunner stepRunner;

    private Map<String, List<Step>> stepsMap = new HashMap<>();
    private Map<String, Flow> flowMap = new HashMap<>();
    private ConcurrentLinkedQueue jobQueue = new ConcurrentLinkedQueue();

    private List<FlowStatusListener> flowStatusListeners = new ArrayList<>();

    private Calendar jobStartTime;
    private Calendar jobEndTime;

    private ExecutorService threadPool;


    public String runFlow(String flowName, List<String> stepNums) {
        Flow flow = flowManager.getFlow(flowName);
        if (flow == null){
            throw new RuntimeException("Flow not found");
        }
        Iterator<String> stepItr = stepNums.iterator();
        List<Step> steps = new ArrayList<>();
        while(stepItr.hasNext()) {
            Step tmpStep = flow.getStep(stepItr.next());
            if(tmpStep == null){
                throw new RuntimeException("Step not found");
            }
            steps.add(tmpStep);
        }

        String jobId = UUID.randomUUID().toString();
        stepsMap.put(jobId, steps);
        flowMap.put(jobId, flow);
        jobQueue.add(jobId);
        if(! isRunning.get()){
            initializeFlow(jobId);
        }
        return jobId;
    }

    private void initializeFlow(String jobId) {
        isRunning.set(true);
        jobStartTime = Calendar.getInstance();
        runningJobId = jobId;
        runningFlow = flowMap.get(runningJobId);
        threadPool = Executors.newFixedThreadPool(1);
        threadPool.submit(new FlowRunnerTask(runningFlow, runningJobId));
    }

    public void stopJob(String jobId) {
        if (jobId.equals(runningJobId)) {
            jobEndTime = Calendar.getInstance();
            isRunning.set(false);
        }
        stepRunner.stop();
        threadPool.shutdown();
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
            List<Step> stepList = stepsMap.get(jobQueue.peek());
            Iterator<Step> itr = stepList.iterator();
            while ((itr.hasNext())){
                Step step = itr.next();
                runningStep = step;
                stepRunner = new StepRunnerFactory().getStepRunner(step)
                    .withJobId(jobId)
                    .onItemFailed((jobId, itemId)-> {
                        if(flow.isStopOnError()){
                            stopJob(jobId);
                        }
                    })
                    .onStatusChanged((jobId, percentComplete, message) ->{
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChange(jobId, step, percentComplete, step.getName() + " " + message);
                        });

                    });
                stepRunner.run();
                stepRunner.awaitCompletion();
            }
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
