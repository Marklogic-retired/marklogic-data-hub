package com.marklogic.hub.flow;

public interface FlowStatusListener {
    void onStatusChange(String jobId, int percentComplete, String message);
}
