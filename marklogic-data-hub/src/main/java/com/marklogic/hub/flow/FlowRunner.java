package com.marklogic.hub.flow;


import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public interface FlowRunner {

    /**
     * Runs the flow, with a specific set of steps, with all custom settings
     *
     * @param flow the flow to run
     * @param steps the steps in the flow to run
     * @param jobId the jobid to be used for the flow
     * @param options the key/value options to be passed
     * @param batchSize the number of documents to handle at once
     * @param threadCount the number of threads to use for the flow running
     * @param sourceDB the db to draw documents from, also where the flow will be first executed from
     * @param destDB the DB where any write activity will take place
     *
     */
    RunFlowResponse runFlow(String flow, List<String> steps, String jobId, Map<String, Object> options, Integer batchSize, Integer threadCount, String sourceDB, String destDB);

    /**
     * Runs the flow, with a specific set of steps, with all custom settings
     *
     * @param flow the flow to run
     * @param jobId the jobid to be used for the flow
     *
     */
    RunFlowResponse runFlow(String flow, String jobId);

    /**
     * Runs the flow, with a specific set of steps, with all custom settings
     *
     * @param flow the flow to run
     * @param steps the steps in the flow to run
     * @param jobId the jobid to be used for the flow
     *
     */
    RunFlowResponse runFlow(String flow, List<String> steps, String jobId);

    /**
     * Runs the flow, with a specific set of steps, with all custom settings
     *
     * @param flow the flow to run
     * @param jobId the jobid to be used for the flow
     * @param options the key/value options to be passed
     *
     */
    RunFlowResponse runFlow(String flow, String jobId, Map<String, Object> options);

    /**
     * Runs the flow, with a specific set of steps, with all custom settings
     *
     * @param flow the flow to run
     * @param steps the steps in the flow to run
     * @param jobId the jobid to be used for the flow
     * @param options the key/value options to be passed
     *
     */
    RunFlowResponse runFlow(String flow, List<String> steps, String jobId, Map<String, Object> options);

    /**
     * Runs the flow, with a specific set of steps, with all defaults from step
     *
     * @param flow the flow to run
     * @param steps the steps in the flow to run
     *
     */
    RunFlowResponse runFlow(String flow, List<String> steps);

    /**
     * Runs the entire flow, with full defaults
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
