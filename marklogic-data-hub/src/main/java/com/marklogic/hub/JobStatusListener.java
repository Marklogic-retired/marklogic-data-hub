package com.marklogic.hub;

public interface JobStatusListener {
    void onStatusChange(String jobId, int percentComplete, String message);
    void onJobFinished();
}
