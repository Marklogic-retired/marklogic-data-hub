package com.marklogic.hub.clientjar;

import com.beust.jcommander.Parameter;
import com.marklogic.hub.impl.CommandLineFlowInputs;

import java.util.List;

/**
 * Extends CommandLineFlowInputs and adds JCommander Parameter annotations to setters so that they can be invoked via
 * JCommander command-line arguments.
 */
public class ClientJarFlowInputs extends CommandLineFlowInputs {


    @Parameter(names = "-flowName", required = true, description = "The name of the flow to run")
    @Override
    public void setFlowName(String flowName) {
        super.setFlowName(flowName);
    }

    @Parameter(names = "-batchSize", description = "The number of items to process in each batch")
    @Override
    public void setBatchSize(Integer batchSize) {
        super.setBatchSize(batchSize);
    }

    @Parameter(names = "-threadCount", description = "The number of threads to process batches with")
    @Override
    public void setThreadCount(Integer threadCount) {
        super.setThreadCount(threadCount);
    }

    @Parameter(names = "-inputFilePath", description = "The directory path for an ingestion step to read from")
    @Override
    public void setInputFilePath(String inputFilePath) {
        super.setInputFilePath(inputFilePath);
    }

    @Parameter(names = "-inputFileType", description = "The type of files for an ingestion step to process")
    @Override
    public void setInputFileType(String inputFileType) {
        super.setInputFileType(inputFileType);
    }

    @Parameter(names = "-outputURIReplacement", description = "The pattern for replacing a portion of a file-based URI during an ingestion step")
    @Override
    public void setOutputURIReplacement(String outputURIReplacement) {
        super.setOutputURIReplacement(outputURIReplacement);
    }

    @Parameter(names = "-outputURIPrefix", description = "The prefix of the URIs of documents during an ingestion step. It shouldn't be used if 'outputURIReplacement' is set")
    @Override
    public void setOutputURIPrefix(String outputURIPrefix) {
        super.setOutputURIPrefix(outputURIPrefix);
    }

    @Parameter(names = "-separator", description = "The separator value to use when processing a file during an ingestion step")
    @Override
    public void setSeparator(String separator) {
        super.setSeparator(separator);
    }

    @Parameter(names = "-showOptions", description = "If included, prints the options JSON object set via '-optionsJson' or '-optionsFile' (no parameter value allowed)")
    @Override
    public void setShowOptions(Boolean showOptions) {
        super.setShowOptions(showOptions);
    }

    @Parameter(names = "-failHard", description = "If included, forces a job to stop once a batch fails (no parameter value allowed)")
    @Override
    public void setFailHard(Boolean failHard) {
        super.setFailHard(failHard);
    }

    @Parameter(names = "-steps", description = "Comma-delimited string of step numbers to run; e.g. -steps 2,3,5")
    @Override
    public void setSteps(List<String> steps) {
        super.setSteps(steps);
    }

    @Parameter(names = "-jobId", description = "A user-specified job ID")
    @Override
    public void setJobId(String jobId) {
        super.setJobId(jobId);
    }

    @Parameter(names = "-optionsFile", description = "Path to a file containing a JSON object for overriding step options")
    @Override
    public void setOptionsFile(String optionsFile) {
        super.setOptionsFile(optionsFile);
    }

    @Parameter(names = "-optionsJson", description = "JSON object for overriding step options; e.g. -optionsJson \"{\\\"sourceQuery\\\":\\\"cts.collectionQuery('test')\\\"}\"")
    @Override
    public void setOptionsJSON(String optionsJSON) {
        super.setOptionsJSON(optionsJSON);
    }
}
