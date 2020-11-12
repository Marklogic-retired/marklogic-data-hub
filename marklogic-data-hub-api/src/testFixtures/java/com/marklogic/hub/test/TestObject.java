package com.marklogic.hub.test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.ext.helper.LoggingObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

/**
 * Base class for any object that helps with writing tests. Should only contain the most generic helper methods.
 */
public abstract class TestObject extends LoggingObject {

    protected ObjectMapper objectMapper = new ObjectMapper();

    protected void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ex) {
            logger.warn("Unexpected InterruptedException: " + ex.getMessage());
        }
    }

    protected InputStream readInputStreamFromClasspath(String path) {
        try {
            return new ClassPathResource(path).getInputStream();
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    protected String readStringFromClasspath(String path) {
        try {
            return new String(FileCopyUtils.copyToByteArray(readInputStreamFromClasspath(path)));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    protected ObjectNode readJsonObject(String json) {
        try {
            return (ObjectNode) objectMapper.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    protected ObjectNode readJsonObject(File file) {
        try {
            return (ObjectNode) objectMapper.readTree(file);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    protected ArrayNode readJsonArray(String json) {
        try {
            return (ArrayNode) objectMapper.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
