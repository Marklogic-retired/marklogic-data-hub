package com.marklogic.hub.flow;

public interface FlowItemFailureListener {
    void processFailure(String jobId, String itemId);
}
