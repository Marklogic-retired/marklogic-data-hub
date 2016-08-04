package com.marklogic.quickstart.model;

public class JobStatusMessage extends StatusMessage {

    public String jobId;
    public String jobType;

    public JobStatusMessage(String jobId, int percentComplete, String message, String jobType) {
        super(percentComplete, message);
        this.jobId = jobId;
        this.jobType = jobType;
    }
}
