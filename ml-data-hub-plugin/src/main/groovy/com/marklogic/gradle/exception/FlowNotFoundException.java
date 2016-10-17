package com.marklogic.gradle.exception;

public class FlowNotFoundException extends Exception {
    FlowNotFoundException(String entityName, String flowName) {
        super("Flow Not Found: [" + entityName + ":" + flowName + "]");
    }

}
