package com.marklogic.hub.model;

public class RunFlowModel {
    private String entityName;
    private String flowName;
    private String inputPath;
    private String collection;
    private String dataFormat;

    public String getEntityName() {
        return entityName;
    }

    public String getFlowName() {
        return flowName;
    }

    public String getInputPath() {
        return inputPath;
    }

    public String getCollection() {
        return collection;
    }

    public String getDataFormat() {
        return dataFormat;
    }
}
