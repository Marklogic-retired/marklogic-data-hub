package com.marklogic.hub.flow;

public interface FlowItemCompleteListener {
    void processCompletion(String jobId, String itemId);
}
