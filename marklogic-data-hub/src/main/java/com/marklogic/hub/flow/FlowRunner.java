package com.marklogic.hub.flow;


import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public interface FlowRunner {

    RunFlowResponse runFlow(String flow, List<String> steps);

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

}
