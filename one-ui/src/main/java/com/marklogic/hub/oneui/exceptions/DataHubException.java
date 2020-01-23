package com.marklogic.hub.oneui.exceptions;

public class DataHubException extends RuntimeException {

    private static final long serialVersionUID = 4824858930318275798L;

    public DataHubException(String message, Throwable cause) {
        super(message, cause);
    }

    public DataHubException(String message) {
        super(message);
    }
}
