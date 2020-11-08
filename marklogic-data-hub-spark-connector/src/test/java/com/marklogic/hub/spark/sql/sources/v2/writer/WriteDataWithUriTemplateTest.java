package com.marklogic.hub.spark.sql.sources.v2.writer;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.spark.sql.sources.v2.AbstractSparkConnectorTest;
import org.junit.jupiter.api.Test;
import org.apache.spark.sql.sources.v2.writer.WriterCommitMessage;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class WriteDataWithUriTemplateTest extends AbstractSparkConnectorTest {

    @Test
    void testInvalidUriTemplate1() {
        String uriTemplate = "{property1.json";
        RuntimeException e = assertThrows(RuntimeException.class, () -> initializeDataWriter(newFruitOptions().withUriTemplate(uriTemplate)));
        assertEquals("Unclosed token in uritemplate={property1.json.",e.getMessage());
    }

    @Test
    void testInvalidUriTemplate2() {
        String uriTemplate = "property2}.json";
        RuntimeException e = assertThrows(RuntimeException.class, () -> initializeDataWriter(newFruitOptions().withUriTemplate(uriTemplate)));
        assertEquals("Closing curly bracket found without opening bracket. uritemplate=property2}.json.",e.getMessage());
    }

    @Test
    void testInvalidUriTemplate3() {
        String uriTemplate = "{{property1}property2}.json";
        RuntimeException e = assertThrows(RuntimeException.class, () -> initializeDataWriter(newFruitOptions().withUriTemplate(uriTemplate)));
        assertEquals("Nested tokens in uritemplate={{property1}property2}.json.",e.getMessage());
    }

    @Test
    void testInvalidUriTemplate4() {
        String uriTemplate = "{{property1}.json";
        RuntimeException e = assertThrows(RuntimeException.class, () -> initializeDataWriter(newFruitOptions().withUriTemplate(uriTemplate)));
        assertEquals("Nested tokens in uritemplate={{property1}.json.",e.getMessage());
    }

    @Test
    void testInvalidUriTemplate5() {
        String uriTemplate = "/a/b/c/{}.json";
        RuntimeException e = assertThrows(RuntimeException.class, () -> initializeDataWriter(newFruitOptions().withUriTemplate(uriTemplate)));
        assertEquals("UriTemplate has empty tokens. uritemplate=/a/b/c/{}.json.",e.getMessage());
    }

    @Test
    void ingestDocWithUriTemplate() {
        initializeDataWriter(newFruitOptions().withUriTemplate("/fruit/{fruitColor}/{fruitName}.json"));
        writeRows(buildRow("pineapple", "green"));
        String uri = getFruitUris()[0];
        assertEquals("/fruit/green/pineapple.json",uri);
    }

    @Test
    void ingestDocWithUriTemplateNullInContent() {
        initializeDataWriter(newFruitOptions().withUriTemplate("/fruit/{fruitColor}/{fruitName}.json"));
        WriterCommitMessage response = writeRows(buildRow("pineapple",null));
        assertNotNull(response);
        assertEquals(AtLeastOneWriteFailedMessage.class,response.getClass());
    }

    @Test
    void ingestDocWithUriTemplateUndefinedInContent() {
        initializeDataWriter(newFruitOptions().withUriTemplate("/fruit/{fruitColor}/{fruitName}/{doesnotexist}.json"));
        WriterCommitMessage response = writeRows(buildRow("pineapple",null));
        assertNotNull(response);
        assertEquals(AtLeastOneWriteFailedMessage.class,response.getClass());
    }
}