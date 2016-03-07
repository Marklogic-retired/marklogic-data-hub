package com.marklogic.hub.exception;

public class EntityManagerException extends RuntimeException {

    private static final long serialVersionUID = 4767780854692156195L;

    public EntityManagerException(String message, Throwable cause) {
        super(
                "Error in connecting to the Entity Manager API with the following message: "
                        + message, cause);
    }
}
