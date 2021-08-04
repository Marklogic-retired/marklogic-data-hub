package com.marklogic.hub.central.controllers;

import org.apache.catalina.connector.ClientAbortException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.IOException;

/**
 * Used for testing scenarios that involve controller methods that throw exceptions.
 */
@Controller
@RequestMapping("/api/exceptions")
public class ExceptionThrowingController {

    @RequestMapping(value = "/clientAbortedBrokenPipe", method = RequestMethod.GET)
    public void clientAbortedBrokenPipe() throws IOException {
        throw new ClientAbortException(new IOException("Broken pipe"));
    }

    @RequestMapping(value = "/genericBrokenPipe", method = RequestMethod.GET)
    public void genericBrokenPipe() throws IOException {
        throw new IOException("Broken pipe");
    }
}
