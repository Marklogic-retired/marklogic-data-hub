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
package com.marklogic.hub.job;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marklogic.hub.flow.Flow;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class Job {
    private String jobId;
    private String flowName;

    public List<String> stepOutput;
    private Map<String, Object> fullOutput;
    private String status;

    private long totalEvents = 0;
    private long successfulEvents = 0;
    private long failedEvents = 0;
    private long successfulBatches = 0;
    private long failedBatches = 0;
    private boolean success = false;

    /**
     * @return true if the job ran without errors, false otherwise.
     */
    public boolean isSuccess() {
        return success;
    }

    public Job withJobId(String jobId) {
        this.jobId = jobId;
        return this;
    }

    public static Job withFlow(Flow flow) {
        Job job = new Job();
        job.flowName = flow.getName();
        return job;
    }

    public Job withStepOutput(List<String> stepOutput) {
        this.stepOutput = stepOutput;
        return this;
    }

    public Job withFullOutput(Map<String,Object>  fullOutput) {
        this.fullOutput = fullOutput;
        return this;
    }

    public Job withStepOutput(String jobOutput) {
        if (this.stepOutput == null) {
            this.stepOutput = new ArrayList<>();
        }
        this.stepOutput.add(jobOutput);
        return this;
    }

    public Job withStatus(String status) {
        if(status.contains(JobStatus.COMPLETED_PREFIX) || status.contains(JobStatus.FINISHED.toString())) {
            this.success = true;
        }
        this.status = status;
        return this;
    }

    public Job withSuccess(boolean success) {
        this.success = success;
        return this;
    }

    public Job setCounts(long totalEvents,long successfulEvents, long failedEvents, long successfulBatches, long failedBatches) {
        this.totalEvents = totalEvents;
        this.successfulEvents = successfulEvents;
        this.failedEvents = failedEvents;
        this.successfulBatches = successfulBatches;
        this.failedBatches = failedBatches;
        return this;
    }

    @JsonIgnore
    public String getJobId() {
        return jobId;
    }

    public Map<String, Object> getFullOutput() {
        return fullOutput;
    }

    public String getStatus() {
        return status;
    }

    public List<String> getStepOutput() {
        return stepOutput;
    }

    public long getSuccessfulEvents() {
        return successfulEvents;
    }

    public long getFailedEvents() {
        return failedEvents;
    }

    public long getTotalEvents() {  return totalEvents; }

    public long getSuccessfulBatches() {
        return successfulBatches;
    }

    public long getFailedBatches() {
        return failedBatches;
    }

    @Override
    public String toString() {
        return String.format("[flowName: %s, success: %s, status: %s, totalEvents: %d, successfulEvents: %d, " +
            "failedEvents: %d, successfulBatches: %d, failedBatches: %d]", flowName, String.valueOf(success),
            status, totalEvents, successfulEvents, failedEvents, successfulBatches, failedBatches);
    }
}
