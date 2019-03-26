package com.marklogic.hub.flow;

import com.marklogic.hub.job.Job;

import java.util.Map;

public class RunFlowResponse {
    String jobId;
    String startTime;
    String endTime;
    Map<String, Job> stepResponses;

    public RunFlowResponse(String jobId) {
        this.jobId = jobId;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public Map<String, Job> getStepResponses() {
        return stepResponses;
    }

    public void setStepResponses(Map<String, Job> stepResponses) {
        this.stepResponses = stepResponses;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    @Override
    public String toString() {
        return String.format("{jobId: %d, startTime: %d, endTime: %d, stepResponses: %d}", jobId, startTime, endTime, stepResponses);
    }

}
