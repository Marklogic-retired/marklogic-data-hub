package com.marklogic.hub.flow.impl;

import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.step.StepRunner;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

public class FlowRunnerImpl implements FlowRunner{
    @Autowired
    private HubConfigImpl hubConfig;
    @Autowired
    private FlowManagerImpl flowManager;
    private ThreadPoolExecutor threadPool;
    private AtomicBoolean isRunning;
    private String currentJob;
    private Map<String, List<String>> flowMap = new HashMap<>();
    private LinkedBlockingQueue jobQueue = new LinkedBlockingQueue();
    private Thread runningThread = null;
    private Calendar jobStartTime;
    private Calendar jobEndTime;


    public String runFlow(String flowName, List<String> steps) {
        Flow flow = flowManager.getFlow(flowName);
        if (flow == null){

        }
        //TODO - get steps from flow and make sure they exist
        String jobId = UUID.randomUUID().toString();
        flowMap.put(jobId, steps);
        jobQueue.add(jobId);
        if(! isRunning.get()){
            initializeTask();
        }
        return jobId;
    }

    public void stopJob(String jobId) {
        if (jobId.equals(currentJob)) {
            jobEndTime = Calendar.getInstance();
            isRunning.set(false);
            if ( threadPool != null ) threadPool.shutdownNow();
        }
    }

    private void initializeTask() {
        isRunning.set(true);

    }

    private void launchNextStep(){

    }

    private class StepRunnerTask implements Runnable {
        private StepRunner stepRunner;
        private String jobId;

        @Override
        public void run() {
            while(! jobQueue.isEmpty()){
                List stepList = flowMap.get(jobQueue.peek());
                if(! stepList.isEmpty()) {
                    launchNextStep();
                }

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
        if (runningThread != null) {
            runningThread.join(unit.convert(timeout, TimeUnit.MILLISECONDS));
        }
    }
}
