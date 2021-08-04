package com.marklogic.hub.central.exceptions;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.AbstractMvcTest;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class HandleIOExceptionTest extends AbstractMvcTest {

    @Test
    void clientAbortedBrokenPipe() throws Exception {
        getJson("/api/exceptions/clientAbortedBrokenPipe").andExpect(result -> {
            logger.info(result.getResponse().getContentAsString());
            assertTrue(StringUtils.isEmpty(result.getResponse().getContentAsString()),
                "If an IOException has a message of 'Broken pipe' and is wrapped in a ClientAbortException, then the " +
                    "Spring Boot middle tier isn't able to communicate with the client browser anymore. Thus, there's " +
                    "nothing useful to be sent back. This is per the advice given " +
                    "at https://mtyurt.net/post/spring-how-to-handle-ioexception-broken-pipe.html . Having the " +
                    "exception handler return nothing also prevents a long and potentially confusing stacktrace from " +
                    "being logged. Such a stacktrace is confusing because it looks like a problem that needs " +
                    "correcting just occurred, but that's not the case; the server simply can't communicate with the client anymore.");
        });
    }

    @Test
    void genericBrokenPipe() throws Exception {
        getJson("/api/exceptions/genericBrokenPipe").andExpect(result -> {
            ObjectNode node = readJsonObject(result.getResponse().getContentAsString());
            assertEquals("Broken pipe", node.get("message").asText(),
                "An exception with a message of 'Broken pipe' that is not due to a ClientAbortException is expected to " +
                    "go through the default exception handler, which returns a JSON object containing the " +
                    "exception message; object: " + node);
            assertEquals(500, node.get("code").asInt());
        });
    }
}
