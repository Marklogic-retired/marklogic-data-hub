package com.marklogic.hub.hubcentral;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.hubcentral.HubCentralManager;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class BuildPrettyWriterTest {

    @Test
    void test() throws Exception {
        ObjectWriter writer = new HubCentralManager().buildPrettyWriter();

        ObjectNode node = new ObjectMapper().createObjectNode();
        node.put("hello", "world");
        node.putArray("noItems");
        node.putArray("oneItem").add("one");
        node.putArray("multipleItems").add("one").add("two");

        String json = writer.writeValueAsString(node).replaceAll("\\r", "");
        assertEquals("{\n" +
                "  \"hello\": \"world\",\n" +
                "  \"noItems\": [ ],\n" +
                "  \"oneItem\": [\n" +
                "    \"one\"\n" +
                "  ],\n" +
                "  \"multipleItems\": [\n" +
                "    \"one\",\n" +
                "    \"two\"\n" +
                "  ]\n" +
                "}", json,

            "To minimize the chance of changes in Pari's version control tool due to JSON formatting differences between " +
                "Pari's JSON editor of choice and what Hub Central downloads, the custom pretty printer is expected to do the following:" +
                "\n - Use ': ' instead of ' : ' as a property value separator, which is consistent with qconsole and Intellij and npm's package.json; " +
                "\n - Write each array value on a separate line; " +
                "\n - And ideally an empty array would be [] or [] with a newline character in it, but I haven't figured out " +
                "how to do that yet, so it's expected to be [ ] (with a space in it); actual JSON:\n" + json);
    }
}
