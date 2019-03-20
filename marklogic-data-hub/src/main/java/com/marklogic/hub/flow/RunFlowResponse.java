package com.marklogic.hub.flow;

import com.marklogic.hub.job.Job;

import java.util.Calendar;
import java.util.Map;

public class RunFlowResponse {
    String jobId;
    Calendar startTime;
    Calendar endTime;
    Map<String, Job> stepResponses;

    public RunFlowResponse(String jobId) {
        this.jobId = jobId;
    }

    public Calendar getStartTime() {
        return startTime;
    }

    public void setStartTime(Calendar startTime) {
        this.startTime = startTime;
    }

    public Calendar getEndTime() {
        return endTime;
    }

    public void setEndTime(Calendar endTime) {
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

}
