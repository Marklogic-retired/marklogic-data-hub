package com.marklogic.hub.cli.client;

import com.marklogic.hub.flow.FlowInputs;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class CommandLineFlowInputsTest {

    @Test
    public void test() {
        CommandLineFlowInputs inputs = new CommandLineFlowInputs();
        inputs.setBatchSize(50);
        inputs.setFailHard(true);
        inputs.setFlowName("myFlow");
        inputs.setInputFilePath("/some/path");
        inputs.setInputFileType("CSV");
        inputs.setJobId("myJob");
        inputs.setOptionsJSON("{\"hello\":\"world\"}");
        inputs.setOutputURIReplacement(".*data,'/something'");
        inputs.setSeparator(";");
        inputs.setShowOptions(true);
        inputs.setSteps(Arrays.asList("2", "3"));
        inputs.setThreadCount(3);
        inputs.setOutputURIPrefix("/user");

        Pair<FlowInputs, String> pair = inputs.buildFlowInputs();
        assertNotNull(pair.getRight());
        // Printing the message for manual verification
        System.out.println(pair.getRight());

        FlowInputs flowInputs = pair.getLeft();
        assertEquals("myFlow", flowInputs.getFlowName());
        assertEquals("myJob", flowInputs.getJobId());
        assertEquals(2, flowInputs.getSteps().size());
        assertEquals("2", flowInputs.getSteps().get(0));
        assertEquals("3", flowInputs.getSteps().get(1));

        Map<String, Object> options = flowInputs.getOptions();
        assertEquals("world", options.get("hello"));

        Map<String, Object> stepConfig = flowInputs.getStepConfig();
        assertEquals(Boolean.TRUE, stepConfig.get("stopOnFailure"));
        assertEquals(3, stepConfig.get("threadCount"));
        assertEquals(50, stepConfig.get("batchSize"));

        @SuppressWarnings("unchecked")
        Map<String, Object> fileLocations = (Map<String, Object>) stepConfig.get("fileLocations");
        assertEquals("CSV", fileLocations.get("inputFileType"));
        assertEquals(";", fileLocations.get("separator"));
        assertEquals("/some/path", fileLocations.get("inputFilePath"));
        assertEquals(".*data,'/something'", fileLocations.get("outputURIReplacement"));
        assertEquals("/user", fileLocations.get("outputURIPrefix"));
    }

    @Test
    void readOptionsFromFile() throws IOException {
        CommandLineFlowInputs inputs = new CommandLineFlowInputs();
        inputs.setFlowName("someFlow");
        inputs.setShowOptions(true);

        String filePath = new ClassPathResource("cli-client/test-options.json").getFile().getAbsolutePath();
        inputs.setOptionsFile(filePath);

        Pair<FlowInputs, String> pair = inputs.buildFlowInputs();
        // Printing for manual verification
        System.out.println(pair.getRight());

        Map<String, Object> options = pair.getLeft().getOptions();
        assertEquals("world", options.get("hello"));

        @SuppressWarnings("unchecked")
        List<String> values = (List<String>) options.get("values");
        assertEquals("red", values.get(0));
        assertEquals("green", values.get(1));
        assertEquals("blue", values.get(2));
    }
}
