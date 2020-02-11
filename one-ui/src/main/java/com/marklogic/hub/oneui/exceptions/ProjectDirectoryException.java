package com.marklogic.hub.oneui.exceptions;

public class ProjectDirectoryException extends Exception {
    private String suggestion = null;
    public ProjectDirectoryException(String message, String suggestion) {
        super(message);
        this.suggestion = suggestion;
    }

    public ProjectDirectoryException(String message, String suggestion, Throwable throwable) {
        super(message, throwable);
        this.suggestion = suggestion;
    }

    public String getSuggestion() {
        return this.suggestion;
    }
}
