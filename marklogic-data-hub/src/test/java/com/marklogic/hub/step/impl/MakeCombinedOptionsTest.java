package com.marklogic.hub.step.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.step.StepDefinition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class MakeCombinedOptionsTest {

    FlowImpl flow;
    ObjectNode flowOptions;

    StepDefinition stepDef;
    Map<String, Object> stepDefOptions;

    String stepNumber = "1";
    Map<String, Object> stepOptions;
    Map<String, Object> runtimeOptions;

    Map<String, Object> result;

    @BeforeEach
    void setup() {
        ObjectMapper mapper = new ObjectMapper();

        flow = new FlowImpl();
        flowOptions = mapper.createObjectNode();
        flowOptions.put("winner", "flow");
        flow.setOptions(flowOptions);

        Step step = new Step();
        stepOptions = new HashMap<>();
        step.setOptions(stepOptions);
        Map<String, Step> steps = new HashMap<>();
        steps.put(stepNumber, step);
        flow.setSteps(steps);

        CustomStepDefinitionImpl customStepDef = new CustomStepDefinitionImpl("stepTypeDoesntMatter");
        stepDefOptions = new HashMap<>();
        stepDefOptions.put("winner", "stepDef");
        customStepDef.setOptions(stepDefOptions);
        this.stepDef = customStepDef;

        runtimeOptions = new HashMap<>();
    }

    @Test
    void flowOverridesStepDef() {
        makeCombinedOptions();
        assertEquals("flow", result.get("winner"), "flow takes precedence over step def");
    }

    @Test
    void stepOverridesFlow() {
        stepOptions.put("winner", "step");
        makeCombinedOptions();
        assertEquals("step", result.get("winner"), "step takes precedence over flow");
    }

    @Test
    void runtimeOverridesStep() {
        stepOptions.put("winner", "step");
        runtimeOptions.put("winner", "runtime");
        makeCombinedOptions();
        assertEquals("runtime", result.get("winner"), "runtime takes precedence over step");
    }

    @Test
    void stepSpecificOverridesEverything() {
        Map<String, Object> stepOptions = new HashMap<>();
        Map<String, Object> stepOneOptions = new HashMap<>();
        stepOneOptions.put("winner", "stepSpecific1");
        Map<String, Object> stepTwoOptions = new HashMap<>();
        stepTwoOptions.put("winner", "stepSpecific2");
        stepOptions.put("1", stepOneOptions);
        stepOptions.put("2", stepTwoOptions);
        runtimeOptions.put("stepOptions", stepOptions);
        runtimeOptions.put("winner", "runtime");

        makeCombinedOptions();
        assertEquals("stepSpecific1", result.get("winner"), "stepOptions takes precedence over everything");

        stepNumber = "2";
        makeCombinedOptions();
        assertEquals("stepSpecific2", result.get("winner"), "stepOptions takes precedence over everything");
    }

    @Test
    void invalidStepOptions() {
        Map<String, Object> stepOptions = new HashMap<>();
        runtimeOptions.put("stepOptions", "this is invalid");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> makeCombinedOptions(),
            "stepOptions must be a JSON object");
        assertTrue(ex.getMessage().contains("Unable to apply step-specific options"), "Unexpected message: " + ex.getMessage());
    }

    @Test
    void invalidStepSpecificOptions() {
        Map<String, Object> stepOptions = new HashMap<>();
        stepOptions.put(stepNumber, "this is invalid");
        runtimeOptions.put("stepOptions", stepOptions);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> makeCombinedOptions(),
            "The value of a key under stepOptions must be a JSON object");
        assertTrue(ex.getMessage().contains("Unable to apply step-specific options"), "Unexpected message: " + ex.getMessage());
    }

    private void makeCombinedOptions() {
        result = StepRunnerUtil.makeCombinedOptions(flow, stepDef, stepNumber, runtimeOptions);
    }
}
