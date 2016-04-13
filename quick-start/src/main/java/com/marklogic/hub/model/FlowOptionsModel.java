package com.marklogic.hub.model;

public class RunFlowModel {
    private String entityName;
    private String flowName;
    private String inputPath;
    private String inputFileType;
    private String otherOptions;

    public String getEntityName() {
        return entityName;
    }

    public String getFlowName() {
        return flowName;
    }

    public String getInputPath() {
        return inputPath;
    }

    public String getOtherOptions() {
        return otherOptions;
    }

    public void setOtherOptions(String otherOptions) {
        this.otherOptions = otherOptions;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public void setFlowName(String flowName) {
        this.flowName = flowName;
    }

    public void setInputPath(String inputPath) {
        this.inputPath = inputPath;
    }

    public String getInputFileType() {
        return inputFileType;
    }

    public void setInputFileType(String inputFileType) {
        this.inputFileType = inputFileType;
    }

    
}
