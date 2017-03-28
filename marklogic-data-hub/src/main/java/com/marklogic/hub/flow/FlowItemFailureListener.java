package com.marklogic.hub.flow;

public interface FlowItemFailureListener {
    void processFailure(long jobId, String itemId);
}
