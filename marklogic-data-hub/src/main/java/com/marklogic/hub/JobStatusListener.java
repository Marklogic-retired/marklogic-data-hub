package com.marklogic.hub;

public interface JobStatusListener {
    public void onStatusChange(long jobId, int percentComplete, String message);
    public void onJobFinished();
}
