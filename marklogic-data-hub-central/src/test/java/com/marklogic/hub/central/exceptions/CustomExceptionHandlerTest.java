package com.marklogic.hub.central.exceptions;

import org.apache.catalina.connector.ClientAbortException;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CustomExceptionHandlerTest {

    CustomExceptionHandler handler = new CustomExceptionHandler();

    @Test
    void testIsClientAbortExceptionDueToBrokenPipe() {
        String message = "Broken pipe";

        Stream.of(
            new ClientAbortException(new IOException(message)),
            new RuntimeException(new ClientAbortException(new IOException(message)))
        ).forEach(ex -> assertTrue(handler.isClientAbortExceptionDueToBrokenPipe(ex), "Exception: " + ex));

        Stream.of(
            new IOException(message),
            new ClientAbortException(message),
            new ClientAbortException(new RuntimeException(message)),
            new ClientAbortException(new IOException("Not a broken pipe")),
            new RuntimeException(new ClientAbortException(new IOException(new RuntimeException(message))))
        ).forEach(ex -> assertFalse(handler.isClientAbortExceptionDueToBrokenPipe(ex), "Exception: " + ex));
    }

}
