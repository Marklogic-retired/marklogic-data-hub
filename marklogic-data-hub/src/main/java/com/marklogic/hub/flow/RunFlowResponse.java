package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

public class RunFlowResponse {
    public long totalCount = 0;
    public long errorCount = 0;
    public List<String> completedItems;
    public List<String> failedItems;
    public List<JsonNode> errors;

    public String toString() {
        return "{totalCount: " + totalCount + ", errorCount: " + errorCount + ", completedItems: " + completedItems.size() + ", failedItems: " + failedItems.size() + ", errors: " + errors.size() + "}";
    }
}
