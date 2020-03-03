/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.exception;

import com.marklogic.hub.explorer.model.ErrorResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@Order(Ordered.HIGHEST_PRECEDENCE)
@ControllerAdvice
public class ExplorerExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(ExplorerExceptionHandler.class);

    private ResponseEntity<?> buildResponseEntity(ErrorResponse ErrorResponse) {
        return new ResponseEntity<>(ErrorResponse.getErrorInfo(), new HttpHeaders(), ErrorResponse.getStatus());
    }

    @ExceptionHandler(ExplorerException.class)
    protected ResponseEntity<?> handleErrorRequest(
        ExplorerException e) {
        HttpStatus statusCode;
        try {
          statusCode = HttpStatus.valueOf(e.statusCode);
        } catch (Exception ex) {
            logger.error(String.format("Could not find matched http status code with ML status code (%d) ! %s", e.statusCode, e));
            //set it as 500 error
            statusCode = HttpStatus.valueOf(500);
        }
        ErrorResponse ErrorResponse = new ErrorResponse(statusCode, e.error, e);
        return buildResponseEntity(ErrorResponse);
    }
}
