package com.marklogic.hub.flow;

public interface BatchCompleteListener {
    void onBatchFailed();
    void onBatchSucceeded();
}
