package com.marklogic.hub.exception;

public class FormValidationException extends RuntimeException {

    private static final long serialVersionUID = 7251931269628838437L;

    public FormValidationException(String message, Throwable cause) {
        super(message, cause);
    }

    public FormValidationException(String message) {
        super(message);
    }
}
