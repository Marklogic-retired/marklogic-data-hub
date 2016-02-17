package com.marklogic.hub.exception;

public class DomainManagerException extends RuntimeException {

    private static final long serialVersionUID = 4767780854692156195L;

    public DomainManagerException(String message, Throwable cause) {
        super(
                "Error in connecting to the Domain Manager API with the following message: "
                        + message, cause);
    }
}
