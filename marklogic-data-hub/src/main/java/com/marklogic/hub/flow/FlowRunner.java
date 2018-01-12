package com.marklogic.hub.flow;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.JobTicket;

import java.util.Map;
import java.util.concurrent.TimeUnit;

public interface FlowRunner {

    FlowRunner withFlow(Flow flow);
    FlowRunner withBatchSize(int batchSize);
    FlowRunner withThreadCount(int threadCount);
    FlowRunner withSourceClient(DatabaseClient sourceClient);
    FlowRunner withDestinationDatabase(String destinationDatabase);
    FlowRunner withOptions(Map<String, Object> options);
    FlowRunner withStopOnFailure(boolean stopOnFailure);

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
