package com.marklogic.hub.flow;


import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public interface FlowRunner {

    /**
     * Runs the flow.
     *
     * @param flow the flow to run
     * @param steps the steps in the flow to run
     *
     */
    RunFlowResponse runFlow(String flow, List<String> steps);

    /**
     * Runs the entire flow.
     *
     * @param flow the flow to run
     *
     */
    RunFlowResponse runFlow(String flow);

    /**
     * Runs the flow.
     *
     * @param jobId the id of the running flow
     *
     */
    void stopJob(String jobId);

    /**
     * Blocks until the flow execution is complete.
     */
    void awaitCompletion();

    /**
     * Blocks until the flow execution is complete.
     *
     * @param timeout the maximum time to wait
     * @param unit the time unit of the timeout argument
     *
     * @throws InterruptedException if interrupted while waiting
     */
    void awaitCompletion(long timeout, TimeUnit unit) throws InterruptedException, TimeoutException;

    /**
     * Sets the status change listener on the flowrunner object
     * @param listener - the listener for when the status changes
     * @return the flow runner object
     */
    FlowRunner onStatusChanged(FlowStatusListener listener);

}
