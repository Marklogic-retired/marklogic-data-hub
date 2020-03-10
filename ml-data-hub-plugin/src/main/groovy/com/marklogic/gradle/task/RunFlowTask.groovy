/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.marklogic.gradle.task


import com.marklogic.gradle.exception.FlowNameRequiredException
import com.marklogic.gradle.exception.HubNotInstalledException
import com.marklogic.hub.cli.client.CommandLineFlowInputs
import com.marklogic.hub.flow.FlowInputs
import com.marklogic.hub.flow.FlowRunner
import com.marklogic.hub.flow.RunFlowResponse
import org.apache.commons.lang3.tuple.Pair
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

class RunFlowTask extends HubTask {

    @Input
    public String flowName

    @Input
    public Integer batchSize

    @Input
    public Integer threadCount

    @Input
    public String inputFilePath

    @Input
    public String inputFileType

    @Input
    public String outputURIReplacement

    @Input
    public String separator

    @Input
    public Boolean showOptions

    @Input
    public Boolean failHard

    @Input
    public List<String> steps

    @Input
    public String jobId

    @TaskAction
    void runFlow() {
        CommandLineFlowInputs inputs = new CommandLineFlowInputs();

        if (flowName == null) {
            flowName = project.hasProperty("flowName") ? project.property("flowName") : null
        }
        if (flowName == null) {
            throw new FlowNameRequiredException()
        }
        inputs.setFlowName(flowName)

        if (jobId == null) {
            jobId = project.hasProperty("jobId") ? project.property("jobId") : null
        }
        inputs.setJobId(jobId)

        if (batchSize == null) {
            batchSize = project.hasProperty("batchSize") ? Integer.parseInt(project.property("batchSize")) : null
        }
        inputs.setBatchSize(batchSize)

        if (threadCount == null) {
            threadCount = project.hasProperty("threadCount") ? Integer.parseInt(project.property("threadCount")) : null
        }
        inputs.setThreadCount(threadCount)

        if (inputFilePath == null) {
            inputFilePath = project.hasProperty("inputFilePath") ? project.property("inputFilePath") : null
        }
        inputs.setInputFilePath(inputFilePath)

        if (inputFileType == null) {
            inputFileType = project.hasProperty("inputFileType") ? project.property("inputFileType") : null
        }
        inputs.setInputFileType(inputFileType)

        if (separator == null) {
            separator = project.hasProperty("separator") ? project.property("separator") : null
        }
        inputs.setSeparator(separator)

        if (outputURIReplacement == null) {
            outputURIReplacement = project.hasProperty("outputURIReplacement") ? project.property("outputURIReplacement") : null
        }
        inputs.setOutputURIReplacement(outputURIReplacement)

        if (showOptions == null) {
            showOptions = project.hasProperty("showOptions") ? Boolean.parseBoolean(project.property("showOptions")) : false
        }
        inputs.setShowOptions(showOptions)

        if (failHard == null) {
            failHard = project.hasProperty("failHard") ? Boolean.parseBoolean(project.property("failHard")) : false
        }
        inputs.setFailHard(failHard)

        if (steps == null) {
            steps = project.hasProperty("steps") ? project.property("steps").toString().trim().tokenize(",") : null
        }
        inputs.setSteps(steps)

        if (project.ext.properties.containsKey("optionsFile")){
            inputs.setOptionsFile(project.ext.options)
        }
        else if (project.ext.properties.containsKey("options")) {
            inputs.setOptionsJSON(project.ext.options)
        }

        if (!isHubInstalled()) {
            throw new HubNotInstalledException()
        }

        Pair<FlowInputs, String> pair = inputs.buildFlowInputs()
        println(pair.getRight())

        FlowInputs flowInputs = pair.getLeft()
        FlowRunner flowRunner = dataHub.getFlowRunner()
        RunFlowResponse runFlowResponse = flowRunner.runFlow(flowName, steps, jobId, flowInputs.getOptions(), flowInputs.getStepConfig())
        flowRunner.awaitCompletion()

        println("\nOutput:")
        println runFlowResponse.toJson()
    }
}
