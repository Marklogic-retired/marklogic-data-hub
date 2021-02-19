package com.marklogic.hub.clientjar;

import com.beust.jcommander.Parameter;
import com.marklogic.hub.impl.CommandLineFlowInputs;

import java.util.List;

/**
 * Defines command-line-specific inputs for running a flow. JCommander Parameter annotations are used so that a
 * JCommander Command class can extend this to inherit all of the parameters. Usable in a Gradle context as well for
 * collecting Gradle properties and then constructing flow inputs.
 */
public class ClientJarFlowInputs extends CommandLineFlowInputs {

    @Parameter(names = "-flowName", required = true, description = "The name of the flow to run")
    @Override
    public String getFlowName() {
        return super.getFlowName();
    }

    @Parameter(names = "-batchSize", description = "The number of items to process in each batch")
    @Override
    public Integer getBatchSize() {
        return super.getBatchSize();
    }

    @Parameter(names = "-threadCount", description = "The number of threads to process batches with")
    @Override
    public Integer getThreadCount() {
        return super.getThreadCount();
    }

    @Parameter(names = "-inputFilePath", description = "The directory path for an ingestion step to read from")
    @Override
    public String getInputFilePath() {
        return super.getInputFilePath();
    }

    @Parameter(names = "-inputFileType", description = "The type of files for an ingestion step to process")
    @Override
    public String getInputFileType() {
        return super.getInputFileType();
    }

    @Parameter(names = "-outputURIReplacement", description = "The pattern for replacing a portion of a file-based URI during an ingestion step")
    @Override
    public String getOutputURIReplacement() {
        return super.getOutputURIReplacement();
    }

    @Parameter(names = "-outputURIPrefix", description = "The prefix of the URIs of documents during an ingestion step. It shouldn't be used if 'outputURIReplacement' is set")
    @Override
    public String getOutputURIPrefix() {
        return super.getOutputURIPrefix();
    }

    @Parameter(names = "-separator", description = "The separator value to use when processing a file during an ingestion step")
    @Override
    public String getSeparator() {
        return super.getSeparator();
    }

    @Parameter(names = "-showOptions", description = "If included, prints the options JSON object set via '-optionsJson' or '-optionsFile' (no parameter value allowed)")
    @Override
    public Boolean getShowOptions() {
        return super.getShowOptions();
    }

    @Parameter(names = "-failHard", description = "If included, forces a job to stop once a batch fails (no parameter value allowed)")
    @Override
    public Boolean getFailHard() {
        return super.getFailHard();
    }

    @Parameter(names = "-steps", description = "Comma-delimited string of step numbers to run; e.g. -steps 2,3,5")
    @Override
    public List<String> getSteps() {
        return super.getSteps();
    }

    @Parameter(names = "-jobId", description = "A user-specified job ID")
    @Override
    public String getJobId() {
        return super.getJobId();
    }

    @Parameter(names = "-optionsFile", description = "Path to a file containing a JSON object for overriding step options")
    @Override
    public String getOptionsFile() {
        return super.getOptionsFile();
    }

    @Parameter(names = "-optionsJson", description = "JSON object for overriding step options; e.g. -optionsJson \"{\\\"sourceQuery\\\":\\\"cts.collectionQuery('test')\\\"}\"")
    @Override
    public String getOptionsJSON() {
        return super.getOptionsJSON();
    }
}
