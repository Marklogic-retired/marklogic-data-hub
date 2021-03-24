package com.marklogic.hub.step.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.step.StepDefinition;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class StepRunnerUtil {

    protected static RunStepResponse getResponse(JsonNode jobNode, String step) {
        RunStepResponse stepDoc;
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            stepDoc = objectMapper.treeToValue(jobNode.get("job").get("stepResponses").get(step), RunStepResponse.class);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return stepDoc;
    }

    protected static RunStepResponse createStepResponse(Flow flow, String step, String jobId) {
        RunStepResponse runStepResponse = RunStepResponse.withFlow(flow).withStep(step);
        if (jobId == null) {
            jobId = UUID.randomUUID().toString();
        }
        runStepResponse.withJobId(jobId);
        return runStepResponse;
    }

    protected static String jsonToString(JsonNode node) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(node);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    protected static String objectToString(Object obj) {
        String objStr = null;
        if (obj instanceof String) {
            objStr = (String) obj;
        } else if (obj instanceof TextNode) {
            objStr = ((TextNode) obj).textValue();
        } else if (obj != null) {
            objStr = obj.toString();
        }
        return objStr;
    }

    /**
     * Note that this logic exists in flow-utils.sjs as well; this is apparently because FlowRunner needs to combine
     * options before it runs any steps. But each call to process a batch of items also needs to combine steps, as
     * it's not always invoked by FlowRunner. So there's some duplication that would be good to get rid of, possibly
     * by having FlowRunner make a call to ML to combine options.
     *
     * @param flow
     * @param stepDef
     * @param stepNumber
     * @param runtimeOptions
     * @return
     */
    public static Map<String, Object> makeCombinedOptions(Flow flow, StepDefinition stepDef, String stepNumber, Map<String, Object> runtimeOptions) {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> stepDefMap = null;
        if (stepDef != null) {
            stepDefMap = mapper.convertValue(stepDef.getOptions(), Map.class);
        }

        Map<String, Object> stepMap = null;
        if (flow.getStep(stepNumber) != null) {
            stepMap = mapper.convertValue(flow.getStep(stepNumber).getOptions(), Map.class);
        }

        Map<String, Object> flowMap = mapper.convertValue(flow.getOptions(), Map.class);

        Map<String, Object> combinedOptions = new HashMap<>();
        if (stepDefMap != null) {
            combinedOptions.putAll(stepDefMap);
        }
        if (flowMap != null) {
            combinedOptions.putAll(flowMap);
        }
        if (stepMap != null) {
            combinedOptions.putAll(stepMap);
        }
        if (runtimeOptions != null) {
            combinedOptions.putAll(runtimeOptions);
            applyStepSpecificOptions(combinedOptions, stepNumber, runtimeOptions);
        }

        return combinedOptions;
    }

    /**
     * Introduced in 5.5 as a way for step-specific options to be provided in the runtime options. A try/catch is used
     * here in case the user does not conform to the schema of:
     * - stepOptions must be a JSON object
     * - each key should be a step number
     * - the value of each key should be a JSON object containing the options specific to that step
     *
     * @param combinedOptions
     * @param stepNumber
     * @param runtimeOptions
     */
    private static void applyStepSpecificOptions(Map<String, Object> combinedOptions, String stepNumber, Map<String, Object> runtimeOptions) {
        if (runtimeOptions.containsKey("stepOptions")) {
            try {
                Map<String, Object> stepOptions = (Map<String, Object>) runtimeOptions.get("stepOptions");
                if (stepOptions.containsKey(stepNumber)) {
                    Map<String, Object> stepSpecificOptions = (Map<String, Object>) stepOptions.get(stepNumber);
                    combinedOptions.putAll(stepSpecificOptions);
                }
            } catch (Exception ex) {
                String message = "Unable to apply step-specific options found in 'stepOptions' in runtime options; " +
                    "stepOptions must be a JSON object whose keys are step numbers, and each key has a JSON object as its value, which contains " +
                    "the options specific to that step; error cause: " + ex.getMessage();
                throw new IllegalArgumentException(message);
            }
        }
    }
}
