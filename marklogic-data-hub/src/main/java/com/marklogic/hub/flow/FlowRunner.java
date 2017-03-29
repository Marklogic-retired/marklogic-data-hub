package com.marklogic.hub.flow;

import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.hub.HubDatabase;

import java.util.Map;
import java.util.concurrent.TimeUnit;

public interface FlowRunner {

    FlowRunner withFlow(Flow flow);
    FlowRunner withBatchSize(int batchSize);
    FlowRunner withThreadCount(int threadCount);
    FlowRunner withSourceDatabase(HubDatabase sourceDatabase);
    FlowRunner withDestinationDatabase(HubDatabase destinationDatabase);
    FlowRunner withOptions(Map<String, Object> options);

    FlowRunner onItemComplete(FlowItemCompleteListener listener);
    FlowRunner onItemFailed(FlowItemFailureListener listener);

    FlowRunner onStatusChanged(FlowStatusListener listener);
    FlowRunner onFinished(FlowFinishedListener listener);

    /**
     * Blocks until the job is complete.
     */
    void awaitCompletion();

    /**
     * Blocks until the job is complete.
     *
     * @param timeout the maximum time to wait
     * @param unit the time unit of the timeout argument
     *
     * @throws InterruptedException if interrupted while waiting
     */
    void awaitCompletion(long timeout, TimeUnit unit) throws InterruptedException;

    JobTicket run();
}
