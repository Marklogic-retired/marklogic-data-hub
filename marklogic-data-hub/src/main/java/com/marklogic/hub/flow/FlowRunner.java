package com.marklogic.hub.flow;

import java.util.List;

public interface FlowRunner {

    String runFlow(String flow, List<String> steps);

    void stopJob(String jobId);
}
