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
package com.marklogic.hub.central.exceptions;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.FailedRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Order(Ordered.HIGHEST_PRECEDENCE)
@ControllerAdvice
public class CustomExceptionHandler extends ResponseEntityExceptionHandler {
    private final static Logger logger = LoggerFactory.getLogger(CustomExceptionHandler.class);
    ObjectMapper mapper = new ObjectMapper();

    @ExceptionHandler(FailedRequestException.class)
    protected ResponseEntity<JsonNode> handleFailedRequestExceptionRequest(FailedRequestException failedRequestException) {
        logger.error(failedRequestException.getMessage(), failedRequestException);

        ObjectNode errJson = mapper.createObjectNode();
        errJson.put("code", failedRequestException.getServerStatusCode());
        errJson.put("message", failedRequestException.getServerStatus());
        HttpStatus httpStatus = HttpStatus.valueOf(failedRequestException.getServerStatusCode());
        errJson.put("suggestion", httpStatusSuggestion(httpStatus));
        errJson.put("details", failedRequestException.getServerMessage());
        return new ResponseEntity<>(errJson, httpStatus);
    }

    @ExceptionHandler(HttpClientErrorException.class)
    protected ResponseEntity<JsonNode> handleHttpClientErrorExceptionRequest(HttpClientErrorException httpClientErrorException) {
        logger.error(httpClientErrorException.getMessage(), httpClientErrorException);

        ObjectNode errJson = mapper.createObjectNode();
        errJson.put("code", httpClientErrorException.getRawStatusCode());
        errJson.put("message", httpClientErrorException.getMessage());
        HttpStatus httpStatus = HttpStatus.valueOf(httpClientErrorException.getRawStatusCode());
        errJson.put("suggestion", httpStatusSuggestion(httpStatus));
        return new ResponseEntity<>(errJson, httpStatus);
    }

    @ExceptionHandler(AccessDeniedException.class)
    protected ResponseEntity<JsonNode> handleAccessDeniedException(AccessDeniedException exception) {
        logger.error(exception.getMessage(), exception);

        ObjectNode errJson = mapper.createObjectNode();
        errJson.put("code", 403);
        errJson.put("message", exception.getMessage());
        errJson.put("suggestion", "Log in as a MarkLogic user with authority to perform this action.");
        return new ResponseEntity<>(errJson, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<JsonNode> handleMaxSizeException(MaxUploadSizeExceededException exception, HttpServletRequest request, HttpServletResponse response) {
        logger.error(exception.getMessage(), exception);

        ObjectNode errJson = mapper.createObjectNode();
        errJson.put("code", 400);
        errJson.put("message", "The total size of all files in a single upload must be 100MB or less.");
        errJson.put("suggestion", "Upload files of size < 100 MB");
        return new ResponseEntity<>(errJson, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    protected ResponseEntity<JsonNode> handleExceptionRequest(Exception exception) {
        logger.error(exception.getMessage(), exception);

        ObjectNode errJson = mapper.createObjectNode();
        errJson.put("code", 500);
        errJson.put("message", exception.getMessage());
        errJson.put("suggestion", "Contact your server administrator.");
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
}
