package com.marklogic.hub.flow;

public interface FlowItemCompleteListener {
    void processCompletion(long jobId, String itemId);
}
