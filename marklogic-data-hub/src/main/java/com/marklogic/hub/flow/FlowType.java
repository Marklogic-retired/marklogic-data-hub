package com.marklogic.hub.flow;

public enum FlowType {
    INPUT("input"), HARMONIZE("harmonize");

    private String type;
    FlowType(String type) {
        this.type = type;
    }

    public static FlowType getFlowType(String type) {
        for (FlowType flowType : FlowType.values()) {
            if (flowType.toString().equals(type)) {
                return flowType;
            }
        }
        return null;
    }

    public String toString() {
        return this.type;
    }
}
