package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.MappingManagerImpl;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.util.json.JSONObject;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.nio.file.Paths;

public class StepManager extends LoggingObject {

    private HubConfig hubConfig;
    private ObjectMapper mapper = new ObjectMapper();

    public StepManager(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    /**
     * String value for the step file extension
     */
    String STEP_FILE_EXTENSION = ".step.json";


    public ObjectNode getLocalStepAsJSON(String stepId) {
        Path stepPath = getStepsPath(stepId).resolve(getStepName(stepId) + STEP_FILE_EXTENSION);
        String suffix = stepId.substring(stepId.lastIndexOf("-") + 1);
        InputStream inputStream = null;
        // first, let's check our resources
        inputStream = getClass().getResourceAsStream("/hub-internal-artifacts/steps/" + suffix + "/" + getStepName(stepId) + STEP_FILE_EXTENSION);
        if (inputStream == null) {
            try {
                inputStream = FileUtils.openInputStream(stepPath.toFile());
            } catch (FileNotFoundException e) {
                return null;
            } catch (IOException e) {
                throw new DataHubProjectException(e.getMessage());
            }
        }
        ObjectNode node;
        try {
            node = (ObjectNode) JSONObject.readInput(inputStream);
        } catch (IOException e) {
            throw new DataHubProjectException("Unable to read step: " + e.getMessage());
        }
        return node;
    }

    public void saveLocalStep(ObjectNode stepNode) {
        ObjectWriter writer = mapper.writerWithDefaultPrettyPrinter();
        String stepId = stepNode.get("stepId").asText();
        File stepFile = getStepsPath(stepId).resolve(getStepName(stepId) + STEP_FILE_EXTENSION).toFile();
        try {
            writer.writeValue(stepFile, stepNode);
            logger.warn(format("Step '%s' was saved", stepFile));
        } catch (IOException e) {
            logger.error(format("Step '%s' save failed; cause: %s", stepFile, e.getMessage()), e);
        }
    }

    public Path getStepsPath(String stepId) {
        String suffix = stepId.substring(stepId.lastIndexOf("-") + 1);
        StepDefinition.StepDefinitionType stepDefType = StepDefinition.StepDefinitionType.getStepDefinitionType(suffix);
        return hubConfig.getHubProject().getStepsPath(stepDefType);
    }

    public String getStepName(String stepId) {
        return stepId.substring(0, stepId.lastIndexOf("-"));
    }
}
