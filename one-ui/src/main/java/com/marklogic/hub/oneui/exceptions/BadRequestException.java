package com.marklogic.hub.oneui.exceptions;

import org.springframework.security.core.AuthenticationException;


public class BadRequestException extends AuthenticationException {

    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String message, Throwable throwable) {
        super(message, throwable);
    }
}
