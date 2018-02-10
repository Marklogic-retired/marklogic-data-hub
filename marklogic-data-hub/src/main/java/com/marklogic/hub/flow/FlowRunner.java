/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
