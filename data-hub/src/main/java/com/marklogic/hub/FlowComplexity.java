package com.marklogic.hub;

public enum FlowComplexity {
    SIMPLE("simple"), ADVANCED("advanced");

    private String name;

    FlowComplexity(String name) {
        this.name = name;
    }

    public static FlowComplexity getFlowComplexity(String complexity) {
        for (FlowComplexity flowComplexity : FlowComplexity.values()) {
            if (flowComplexity.toString().equals(complexity)) {
                return flowComplexity;
            }
        }
        return null;
    }

    public String toString() {
        return name;
    }
}
