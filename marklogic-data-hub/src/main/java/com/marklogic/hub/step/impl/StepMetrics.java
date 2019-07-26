/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.step.impl;

import java.util.concurrent.atomic.AtomicLong;

public class StepMetrics {
    AtomicLong successfulEvents = new AtomicLong(0);
    AtomicLong failedEvents = new AtomicLong(0);
    AtomicLong successfulBatches = new AtomicLong(0);
    AtomicLong failedBatches = new AtomicLong(0);

    public AtomicLong getSuccessfulEvents() {
        return successfulEvents;
    }

    public AtomicLong getFailedEvents() {
        return failedEvents;
    }

    public AtomicLong getSuccessfulBatches() {
        return successfulBatches;
    }

    public AtomicLong getFailedBatches() {
        return failedBatches;
    }

    //shorthand methods for getting the counts
    public long getSuccessfulEventsCount() {
        return successfulEvents.get();
    }

    public long getFailedEventsCount() {
        return failedEvents.get();
    }

    public long getSuccessfulBatchesCount() {
        return successfulBatches.get();
    }

    public long getFailedBatchesCount() {
        return failedBatches.get();
    }
}
