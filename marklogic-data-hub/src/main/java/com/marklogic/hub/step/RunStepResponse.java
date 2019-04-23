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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.impl.Step;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class RunStepResponse {
    private String jobId;
    private String flowName;

    private String stepName;
    private String stepDefinitionName;
    private String stepDefinitionType;

    public List<String> stepOutput;
    private Map<String, Object> fullOutput;
    private String status;

    private long totalEvents = 0;
    private long successfulEvents = 0;
    private long failedEvents = 0;
    private long successfulBatches = 0;
    private long failedBatches = 0;
    private boolean success = false;

    private String stepStartTime;
    private String stepEndTime;

    private Flow flow;
    private static final SimpleDateFormat DATE_TIME_FORMAT = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");

    /**
     * @return true if the job ran without errors, false otherwise.
     */
    public boolean isSuccess() {
        return success;
    }

    public RunStepResponse withJobId(String jobId) {
        this.jobId = jobId;
        return this;
    }

    public static RunStepResponse withFlow(Flow flow) {
        RunStepResponse runStepResponse = new RunStepResponse();
        runStepResponse.flowName = flow.getName();
        runStepResponse.flow = flow;
        runStepResponse.stepStartTime = DATE_TIME_FORMAT.format(new Date());
        return runStepResponse;
    }

    public RunStepResponse withStep(String stepNum) {
        Step step = this.flow.getStep(stepNum);
        this.stepName = step.getName();
        this.stepDefinitionName = step.getStepDefinitionName();
        this.stepDefinitionType = step.getStepDefinitionType().toString();
        return this;
    }

    public RunStepResponse withStepOutput(List<String> stepOutput) {
        this.stepOutput = stepOutput;
        return this;
    }

    public RunStepResponse withFullOutput(Map<String,Object>  fullOutput) {
        this.fullOutput = fullOutput;
        return this;
    }

    public RunStepResponse withStepOutput(String jobOutput) {
        if (this.stepOutput == null) {
            this.stepOutput = new ArrayList<>();
        }
        this.stepOutput.add(jobOutput);
        return this;
    }

    public RunStepResponse withStatus(String status) {
        if(status.contains(JobStatus.COMPLETED_PREFIX) || status.contains(JobStatus.FINISHED.toString())) {
            this.success = true;
        }
        this.status = status;
        return this;
    }

    public RunStepResponse withSuccess(boolean success) {
        this.success = success;
        return this;
    }

    public RunStepResponse setCounts(long totalEvents, long successfulEvents, long failedEvents, long successfulBatches, long failedBatches) {
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

    public String getStepName() {
        return stepName;
    }

    public void setStepName(String stepName) {
        this.stepName = stepName;
    }

    public String getStepDefinitionType() {
        return stepDefinitionType;
    }

    public void setStepDefinitionType(String stepDefinitionType) {
        this.stepDefinitionType = stepDefinitionType;
    }

    public String getStepDefinitionName() {
        return stepDefinitionName;
    }

    public void setStepDefinitionName(String stepDefinitionName) {
        this.stepDefinitionName = stepDefinitionName;
    }

    public String getStepStartTime() {
        return stepStartTime;
    }

    public String getStepEndTime() {
        return stepEndTime;
    }

    public void setStepStartTime(String stepStartTime) {
        this.stepStartTime = stepStartTime;
    }

    public void setStepEndTime(String stepEndTime) {
        this.stepEndTime = stepEndTime;
    }

    @Override
    public String toString() {
        return String.format("[flowName: %s, stepName: %s, stepDefinitionName %s, stepDefinitionType %s, success: %s, " +
                "status: %s, totalEvents: %d, successfulEvents: %d, " + "failedEvents: %d, successfulBatches: %d, " +
                "failedBatches: %d, stepStartTime: %d , stepEndTime: %d]", flowName, stepName, stepDefinitionName,
            stepDefinitionType, String.valueOf(success), status, totalEvents, successfulEvents, failedEvents,
            successfulBatches, failedBatches, stepStartTime, stepStartTime);
    }
}
