/*
 * Copyright 2012-2020 MarkLogic Corporation
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
package com.marklogic.hub.oneui.exceptions;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.impl.FailedRequest;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@Order(Ordered.HIGHEST_PRECEDENCE)
@ControllerAdvice
public class CustomExceptionHandler extends ResponseEntityExceptionHandler {
    ObjectMapper mapper = new ObjectMapper();

    @ExceptionHandler(FailedRequestException.class)
    protected ResponseEntity<JsonNode> handleFailedRequestExceptionRequest(
        FailedRequestException failedRequestException) {
        FailedRequest failedRequest = failedRequestException.getFailedRequest();
        ObjectNode errJson = mapper.createObjectNode();
        errJson.put("code", failedRequest.getStatusCode());
        errJson.put("message", failedRequest.getStatus());
        errJson.put("details", failedRequest.getMessage());
        return new ResponseEntity<>(errJson, HttpStatus.valueOf(failedRequest.getStatusCode()));
    }

    @ExceptionHandler(HttpClientErrorException.class)
    protected ResponseEntity<JsonNode> handleHttpClientErrorExceptionRequest(
            HttpClientErrorException httpClientErrorException) {
        ObjectNode errJson = mapper.createObjectNode();
        errJson.put("code", httpClientErrorException.getRawStatusCode());
        errJson.put("message", httpClientErrorException.getMessage());
        return new ResponseEntity<>(errJson, HttpStatus.valueOf(httpClientErrorException.getRawStatusCode()));
    }
    @ExceptionHandler(ForbiddenException.class)
    protected ResponseEntity<JsonNode> handleForbiddenExceptionRequest(
        ForbiddenException exception) {
        ObjectNode errJson = mapper.createObjectNode();
        errJson.put("code", 403);
        errJson.put("message", exception.getMessage());
        errJson.put("suggestion", "Ensure your MarkLogic user has the proper roles");
        if (exception.getRequiredRoles() != null && exception.getRequiredRoles().size() > 0) {
            ArrayNode requiredRolesArray = errJson.putArray("requiredRoles");
            exception.getRequiredRoles().forEach(requiredRolesArray::add);
        }
        return new ResponseEntity<>(errJson, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<JsonNode> handleExceptionRequest(
            Exception exception) {
        ObjectNode errJson = mapper.createObjectNode();
        errJson.put("code", 500);
        errJson.put("message", exception.getMessage());
        return new ResponseEntity<>(errJson, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
