package com.marklogic.hub.flow;


import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public interface FlowRunner {

    /**
     * Run a flow without any dependency on an underlying HubProject for either finding artifacts (flows and step
     * definitions) or for resolving file paths for an ingestion step. If an ingestion step does have a relative
     * file path, then the ingestion step will fail due to not being able to resolve the relative file path to an
     * absolute file path.
     *
     * Aside from retrieving flows and step definitions from MarkLogic instead of from the filesystem, the behavior of
     * this method - the output of each step and the returned RunFlowResponse - will be identical to that of every
     * other "runFlow" method in this class.
     *
     * @param flowInputs
     * @return
     */
    RunFlowResponse runFlow(FlowInputs flowInputs);

    /**
     * Runs the flow, with a specific set of steps, with all custom settings
     *
     * @deprecated Starting in 5.2.0, prefer runFlow(FlowInputs), which does not depend on Spring or project files on the filesystem
     * @param flow the flow to run
     * @param jobId the jobid to be used for the flow
     * @return a response object
     */
    @Deprecated
    RunFlowResponse runFlow(String flow, String jobId);

    /**
     * Runs the flow, with a specific set of steps, with all custom settings
     *
     * @deprecated Starting in 5.2.0, prefer runFlow(FlowInputs), which does not depend on Spring or project files on the filesystem
     * @param flow the flow to run
     * @param steps the steps in the flow to run
     * @param jobId the jobid to be used for the flow
     * @return a response object
     */
    @Deprecated
    RunFlowResponse runFlow(String flow, List<String> steps, String jobId);

    /**
     * Runs the flow, with a specific set of steps, with all custom settings
     *
     * @deprecated Starting in 5.2.0, prefer runFlow(FlowInputs), which does not depend on Spring or project files on the filesystem
     * @param flow the flow to run
     * @param jobId the jobid to be used for the flow
     * @param options the key/value options to be passed
     * @return a response object
     */
    @Deprecated
    RunFlowResponse runFlow(String flow, String jobId, Map<String, Object> options);

    /**
     * Runs the flow, with a specific set of steps, with all custom settings
     *
     * @deprecated Starting in 5.2.0, prefer runFlow(FlowInputs), which does not depend on Spring or project files on the filesystem
     * @param flow the flow to run
     * @param steps the steps in the flow to run
     * @param jobId the jobid to be used for the flow
     * @param options the key/value options to be passed
     * @return a response object
     */
    @Deprecated
    RunFlowResponse runFlow(String flow, List<String> steps, String jobId, Map<String, Object> options);

    /**
     * Runs the flow, with a specific set of steps, with all custom settings
     *
     * @deprecated Starting in 5.2.0, prefer runFlow(FlowInputs), which does not depend on Spring or project files on the filesystem
     * @param flow the flow to run
     * @param steps the steps in the flow to run
     * @param jobId the jobid to be used for the flow
     * @param options the key/value options to be passed
     * @param stepConfig the key/value config to override the running of the step
     * @return a response object
     */
    @Deprecated
    RunFlowResponse runFlow(String flow, List<String> steps, String jobId, Map<String, Object> options, Map<String, Object> stepConfig);

    /**
     * Runs the flow, with a specific set of steps, with all defaults from step
     *
     * @deprecated Starting in 5.2.0, prefer runFlow(FlowInputs), which does not depend on Spring or project files on the filesystem
     * @param flow the flow to run
     * @param steps the steps in the flow to run
     * @return a response object
     */
    @Deprecated
    RunFlowResponse runFlow(String flow, List<String> steps);

    /**
     * Runs the entire flow, with full defaults
     *
     * @deprecated Starting in 5.2.0, prefer runFlow(FlowInputs), which does not depend on Spring or project files on the filesystem
     * @param flow the flow to run
     * @return a response object
     */
    @Deprecated
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
     * @throws TimeoutException if times out
     */
    void awaitCompletion(long timeout, TimeUnit unit) throws InterruptedException, TimeoutException;
}
