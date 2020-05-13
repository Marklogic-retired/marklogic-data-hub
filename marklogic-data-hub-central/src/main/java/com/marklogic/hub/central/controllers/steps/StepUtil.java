package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.schemas.StepSettingsSchema;

public abstract class StepUtil {

    private static ObjectMapper objectMapper;

    static {
        // This configuration allows for only what the UI considers to be "settings" to be extracted from a full
        // step document
        objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    }

    public static StepSettingsSchema settingsFromJson(JsonNode json) {
        try {
            return objectMapper.treeToValue(json, StepSettingsSchema.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Unable to convert JSON, cause: " + e.getMessage(), e);
        }
    }

    public static ObjectNode valueToTree(Object obj) {
        return (ObjectNode) objectMapper.valueToTree(obj);
    }
}
