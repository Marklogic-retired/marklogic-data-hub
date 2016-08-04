package com.marklogic.quickstart.model;

public class StatusMessage {

    public int percentComplete;
    public String message;

    public StatusMessage(int percentComplete, String message) {
        this.percentComplete = percentComplete;
        this.message = message;
    }
}