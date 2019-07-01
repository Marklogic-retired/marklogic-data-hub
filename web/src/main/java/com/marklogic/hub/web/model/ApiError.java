/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.web.model;

import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

public class ApiError {
    private HttpStatus status;
    Map<String, Object> errorInfo;

    private ApiError() {
        errorInfo = new LinkedHashMap<>();
    }

    private ApiError(HttpStatus status) {
        this();
        this.status = status;
    }

    public ApiError(HttpStatus status, Throwable ex) {
        this(status);
        String msg = checkMessage(ex.getLocalizedMessage());
        setErrorInfo(msg);
    }

    public ApiError(HttpStatus status, String message) {
        this(status);
        setErrorInfo(checkMessage(message));
    }

    private String checkMessage(String message) {
        if (StringUtils.isEmpty(message)) {
            message = status.name();
        }
        return message;
    }

    private void setErrorInfo(String message) {
        errorInfo.put("code", status.value());
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
