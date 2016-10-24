package com.marklogic.hub;

public interface JobStatusListener {
    void onStatusChange(long jobId, int percentComplete, String message);
    void onJobFinished();
}
