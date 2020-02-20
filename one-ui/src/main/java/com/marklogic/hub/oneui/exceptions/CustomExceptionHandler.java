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
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.FailedRequestException;
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
        ObjectNode errJson = mapper.createObjectNode();
        errJson.put("code", failedRequestException.getServerStatusCode());
        errJson.put("message", failedRequestException.getServerStatus());
        HttpStatus httpStatus = HttpStatus.valueOf(failedRequestException.getServerStatusCode());
        errJson.put("suggestion", httpStatusSuggestion(httpStatus));
        errJson.put("details", failedRequestException.getServerMessage());
        return new ResponseEntity<>(errJson, httpStatus);
    }

    @ExceptionHandler(HttpClientErrorException.class)
    protected ResponseEntity<JsonNode> handleHttpClientErrorExceptionRequest(
            HttpClientErrorException httpClientErrorException) {
        ObjectNode errJson = mapper.createObjectNode();
        errJson.put("code", httpClientErrorException.getRawStatusCode());
        errJson.put("message", httpClientErrorException.getMessage());
        HttpStatus httpStatus = HttpStatus.valueOf(httpClientErrorException.getRawStatusCode());
        errJson.put("suggestion", httpStatusSuggestion(httpStatus));
        return new ResponseEntity<>(errJson, httpStatus);
    }
    @ExceptionHandler(ForbiddenException.class)
    protected ResponseEntity<JsonNode> handleForbiddenExceptionRequest(
        ForbiddenException exception) {
        ObjectNode errJson = mapper.createObjectNode();
        errJson.put("code", 403);
        errJson.put("message", exception.getMessage());
        errJson.put("suggestion", "Log in as a MarkLogic user with permissions to install or upgrade Data Hub.");
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
        errJson.put("suggestion", exceptionSuggestion(exception));
        return new ResponseEntity<>(errJson, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private String httpStatusSuggestion(HttpStatus httpStatus) {
        switch (httpStatus) {
            case FORBIDDEN:
                return "Ensure your MarkLogic user has the proper roles for this action.";
            case BAD_REQUEST:
                return "Resend the request in the correct format.";
            case INTERNAL_SERVER_ERROR:
                return "Contact your server administrator.";
            default:
                return null;
        }
    }

    private String exceptionSuggestion(Exception exception) {
        if (exception instanceof ProjectDirectoryException) {
            return ((ProjectDirectoryException) exception).getSuggestion();
        } else {
            return "Contact your server administrator.";
        }
    }
}
