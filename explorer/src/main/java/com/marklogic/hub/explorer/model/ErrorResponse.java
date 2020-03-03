/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.model;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;

public class ErrorResponse {
    private HttpStatus status;
    Map<String, Object> errorInfo;

    private ErrorResponse() {
        errorInfo = new LinkedHashMap<>();
    }

    private ErrorResponse(HttpStatus status) {
        this();
        this.status = status;
    }

    public ErrorResponse(HttpStatus status, Throwable ex) {
        this(status);
        String msg = checkMessage(ex.getLocalizedMessage());
        setErrorInfo(null, msg);
    }

    public ErrorResponse(HttpStatus status, String msgCode, Throwable ex) {
        this(status);
        String msg = checkMessage(ex.getLocalizedMessage());
        setErrorInfo(msgCode, msg);
    }

    public ErrorResponse(HttpStatus status, String message) {
        this(status);
        setErrorInfo(null, checkMessage(message));
    }

    private String checkMessage(String message) {
        if (StringUtils.isEmpty(message)) {
            message = status.getReasonPhrase();
        }
        return message;
    }

    private void setErrorInfo(String error, String message) {
        errorInfo.put("status", status.value());
        if (StringUtils.isNotEmpty(error)) {
            errorInfo.put("error", error);
        }
        errorInfo.put("message", message);
        errorInfo.put("timestamp", String.valueOf(LocalDateTime.now()));
    }

    public HttpStatus getStatus() {
        return this.status;
    }

    public Map<String, Object> getErrorInfo() {
        return this.errorInfo;
    }
}
