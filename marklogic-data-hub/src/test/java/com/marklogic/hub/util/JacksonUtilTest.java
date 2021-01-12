package com.marklogic.hub.util;

import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.hub.test.TestObject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class JacksonUtilTest extends TestObject {

    @Test
    void printArrayValuesOnSeparateLines() throws Exception {
        ArrayNode array = objectMapper.createArrayNode();
        array.add("hello").add("world");

        ObjectWriter writer = JacksonUtil.newWriterWithSeparateLinesForArrayValues();
        String response = writer.writeValueAsString(array);

        String[] lines = response.split("\n");
        assertEquals(4, lines.length, "Expecting one line for each bracket and one line for each value");
        assertEquals("\"hello\",", lines[1].trim());
        assertEquals("\"world\"", lines[2].trim());
    }
}
