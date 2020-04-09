package com.marklogic.hub.central.exceptions;

import org.springframework.security.core.AuthenticationException;

import java.util.List;

public class ForbiddenException extends AuthenticationException {

    private List<String> requiredRoles;

    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException(String message, List<String> requiredRoles) {
        this(message);
        this.requiredRoles = requiredRoles;
    }

    public List<String> getRequiredRoles() {
        return requiredRoles;
    }
}
