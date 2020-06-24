package com.marklogic.hub.flow;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class FlowInputsTest {

    @Test
    void setInputFilePath() {
        FlowInputs inputs = new FlowInputs("anyflow");
        inputs.setInputFilePath("/path/to/data");

        @SuppressWarnings("unchecked")
        Map<String, Object> fileLocations = (Map<String, Object>) inputs.getStepConfig().get("fileLocations");
        assertEquals("/path/to/data", fileLocations.get("inputFilePath"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void setInputFilePathWithExistingStepConfig() {
        FlowInputs inputs = new FlowInputs("anyflow");

        Map<String, Object> stepConfig = new HashMap<>();
        stepConfig.put("some", "thing");
        Map<String, Object> fileLocations = new HashMap<>();
        fileLocations.put("inputFilePath", "this should be replaced");
        fileLocations.put("hello", "world");
        stepConfig.put("fileLocations", fileLocations);
        inputs.setStepConfig(stepConfig);

        inputs.setInputFilePath("/path/to/data");

        fileLocations = (Map<String, Object>) inputs.getStepConfig().get("fileLocations");
        assertEquals("/path/to/data", fileLocations.get("inputFilePath"));
        assertEquals("world", fileLocations.get("hello"));
        assertEquals("thing", inputs.getStepConfig().get("some"));
    }
}
