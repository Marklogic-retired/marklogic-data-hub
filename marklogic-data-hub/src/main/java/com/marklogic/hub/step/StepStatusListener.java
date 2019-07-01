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
package com.marklogic.hub.step;

public interface StepStatusListener {
    /**
     *
     * @param jobId - the id of the job to change
     * @param percentComplete - the percentage of completeness expressed as an int
     * @param status - indicate intermediate status based on step status
     * @param successfulEvents - the number of successful events
     * @param failedEvents - the number of failed events
     * @param message - the message you'd like to send along with it
     */
    void onStatusChange(String jobId, int percentComplete, String status, long successfulEvents, long failedEvents, String message);
}
