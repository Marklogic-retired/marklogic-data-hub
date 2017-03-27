package com.marklogic.hub.flow;

import java.util.List;

public class RunFlowResponse {
    public long totalCount = 0;
    public long errorCount = 0;
    public List<String> completedItems;
    public List<String> failedItems;
}
