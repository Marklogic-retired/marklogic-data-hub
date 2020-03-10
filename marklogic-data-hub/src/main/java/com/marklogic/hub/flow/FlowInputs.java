package com.marklogic.hub.flow;

import java.util.*;

public class FlowInputs {

    private String flowName;
    private List<String> steps;
    private String jobId;
    private Map<String, Object> options;
    private Map<String, Object> stepConfig;

    public FlowInputs() {
    }

    public FlowInputs(String flowName) {
        this.flowName = flowName;
    }

    public FlowInputs(String flowName, String... steps) {
        this.flowName = flowName;
        this.steps = Arrays.asList(steps);
    }

    /**
     * A common step configuration to override at runtime is the inputFilePath for an ingestion step. This convenience
     * method allows for doing that without modifying any existing step configuration.
     *
     * @param inputFilePath
     */
    public void setInputFilePath(String inputFilePath) {
        if (stepConfig == null) {
            stepConfig = new HashMap<>();
        }
        Map<String, Object> fileLocations = (Map<String, Object>)stepConfig.get("fileLocations");
        if (fileLocations == null) {
            fileLocations = new HashMap<>();
            stepConfig.put("fileLocations", fileLocations);
        }
        fileLocations.put("inputFilePath", inputFilePath);
    }

    public String getFlowName() {
        return flowName;
    }

    public void setFlowName(String flowName) {
        this.flowName = flowName;
    }

    public List<String> getSteps() {
        return steps;
    }

    public void setSteps(List<String> steps) {
        this.steps = steps;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public Map<String, Object> getOptions() {
        return options;
    }

    public void setOptions(Map<String, Object> options) {
        this.options = options;
    }

    public Map<String, Object> getStepConfig() {
        return stepConfig;
    }

    public void setStepConfig(Map<String, Object> stepConfig) {
        this.stepConfig = stepConfig;
    }
}
