package com.marklogic.hub.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.flow.FlowInputs;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Defines command-line-specific inputs for running a flow. JCommander Parameter annotations are used so that a
 * JCommander Command class can extend this to inherit all of the parameters. Usable in a Gradle context as well for
 * collecting Gradle properties and then constructing flow inputs.
 */
public class CommandLineFlowInputs {

    private String flowName;
    private Integer batchSize;
    private Integer threadCount;
    private String inputFilePath;
    private String inputFileType;
    private String outputURIReplacement;
    private String outputURIPrefix;
    private String separator;
    private Boolean failHard = false;
    private List<String> steps;
    private String jobId;
    private String optionsJSON;
    private String optionsFile;
    private Boolean showOptions = false;

    public Pair<FlowInputs, String> buildFlowInputs() {
        StringBuilder runFlowString = new StringBuilder("Running flow: [" + flowName + "]");

        if (steps != null) {
            runFlowString.append(", steps: " + steps);
        }

        FlowInputs flowInputs = new FlowInputs(flowName);
        flowInputs.setSteps(steps);
        flowInputs.setJobId(jobId);
        flowInputs.setStepConfig(buildStepConfig(runFlowString));

        Map<String, Object> flowOptions = buildFlowOptions();
        flowInputs.setOptions(flowOptions);
        if (showOptions && flowOptions != null) {
            runFlowString.append("\n\tand options:");
            for (String key : flowOptions.keySet()) {
                runFlowString.append("\n\t\t" + key + " = " + flowOptions.get(key));
            }
        }

        return Pair.of(flowInputs, runFlowString.toString());
    }

    protected Map<String, Object> buildStepConfig(StringBuilder runFlowString) {
        Map<String, Object> stepConfig = new HashMap<>();

        if (batchSize != null) {
            runFlowString.append("\n\twith batch size: " + batchSize);
            stepConfig.put("batchSize", batchSize);
        }
        if (threadCount != null) {
            runFlowString.append("\n\twith thread count: " + threadCount);
            stepConfig.put("threadCount", threadCount);
        }
        if (failHard) {
            runFlowString.append("\n\t\twith fail hard: " + failHard);
            stepConfig.put("stopOnFailure", failHard);
        }

        if (inputFileType != null || inputFilePath != null || outputURIReplacement != null || separator != null || outputURIPrefix != null) {
            runFlowString.append("\n\tWith File Locations Settings:");
            Map<String, String> fileLocations = new HashMap<>();
            if (inputFileType != null) {
                runFlowString.append("\n\t\tInput File Type: " + inputFileType);
                fileLocations.put("inputFileType", inputFileType);
            }
            if (inputFilePath != null) {
                runFlowString.append("\n\t\tInput File Path: " + inputFilePath);
                fileLocations.put("inputFilePath", inputFilePath);
            }

            if (outputURIPrefix != null) {
                runFlowString.append("\n\t\tOutput URI Prefix: " + outputURIPrefix);
                fileLocations.put("outputURIPrefix", outputURIPrefix);
            }

            if (outputURIReplacement != null) {
                runFlowString.append("\n\t\tOutput URI Replacement: " + outputURIReplacement);
                fileLocations.put("outputURIReplacement", outputURIReplacement);
            }
            if (separator != null) {
                if (inputFileType != null && !inputFileType.equalsIgnoreCase("csv")) {
                    throw new IllegalArgumentException("Invalid argument for file type " + inputFileType + ". When specifying a separator, the file type must be 'csv'");
                }
                runFlowString.append("\n\t\tSeparator: " + separator);
                fileLocations.put("separator", separator);
            }

            stepConfig.put("fileLocations", fileLocations);
        }

        return stepConfig;
    }

    protected Map<String, Object> buildFlowOptions() {
        String optionsString;
        if (StringUtils.isNotEmpty(optionsFile)) {
            try {
                optionsString = new String(FileCopyUtils.copyToByteArray(new File(optionsFile)));
            } catch (IOException ex) {
                throw new RuntimeException("Unable to read options file at: " + optionsFile, ex);
            }
        } else {
            optionsString = optionsJSON;
        }

        Map<String, Object> optionsMap = null;
        if (StringUtils.isNotEmpty(optionsString)) {
            try {
                optionsMap = new ObjectMapper().readValue(optionsString, new TypeReference<Map<String, Object>>() {});
            } catch (IOException ex) {
                throw new RuntimeException("Unable to parse JSON options string: " + optionsString, ex);
            }
        }

        // Needed to force the flow to stop, not just the step
        if (this.failHard) {
            if (optionsMap == null) {
                optionsMap = new HashMap<>();
            }
            optionsMap.put("stopOnError", true);
        }

        return optionsMap;
    }

    public String getFlowName() {
        return flowName;
    }

    public void setFlowName(String flowName) {
        this.flowName = flowName;
    }

    public Integer getBatchSize() {
        return batchSize;
    }

    public void setBatchSize(Integer batchSize) {
        this.batchSize = batchSize;
    }

    public Integer getThreadCount() {
        return threadCount;
    }

    public void setThreadCount(Integer threadCount) {
        this.threadCount = threadCount;
    }

    public String getInputFilePath() {
        return inputFilePath;
    }

    public void setInputFilePath(String inputFilePath) {
        this.inputFilePath = inputFilePath;
    }

    public String getInputFileType() {
        return inputFileType;
    }

    public void setInputFileType(String inputFileType) {
        this.inputFileType = inputFileType;
    }

    public String getOutputURIReplacement() {
        return outputURIReplacement;
    }

    public void setOutputURIReplacement(String outputURIReplacement) {
        this.outputURIReplacement = outputURIReplacement;
    }

    public String getOutputURIPrefix() {
        return outputURIPrefix;
    }

    public void setOutputURIPrefix(String outputURIPrefix) {
        this.outputURIPrefix = outputURIPrefix;
    }

    public String getSeparator() {
        return separator;
    }

    public void setSeparator(String separator) {
        this.separator = separator;
    }

    public Boolean getShowOptions() {
        return showOptions;
    }

    public void setShowOptions(Boolean showOptions) {
        this.showOptions = showOptions;
    }

    public Boolean getFailHard() {
        return failHard;
    }

    public void setFailHard(Boolean failHard) {
        this.failHard = failHard;
    }

    public List<String> getSteps() {
        return steps;
    }

    public void setSteps(List<String> steps) {
        this.steps = steps;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getOptionsFile() {
        return optionsFile;
    }

    public void setOptionsFile(String optionsFile) {
        this.optionsFile = optionsFile;
    }

    public String getOptionsJSON() {
        return optionsJSON;
    }

    public void setOptionsJSON(String optionsJSON) {
        this.optionsJSON = optionsJSON;
    }
}
