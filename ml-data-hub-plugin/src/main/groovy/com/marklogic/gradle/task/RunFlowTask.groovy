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

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.marklogic.gradle.exception.FlowNameRequiredException
import com.marklogic.gradle.exception.FlowNotFoundException
import com.marklogic.gradle.exception.HubNotInstalledException
import com.marklogic.hub.FlowManager
import com.marklogic.hub.flow.Flow
import com.marklogic.hub.flow.RunFlowResponse
import groovy.json.JsonBuilder
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
    public Boolean showOptions

    @Input
    public Boolean failHard

    @Input
    public List<String> steps

    @Input
    public String jobId

    @TaskAction
    void runFlow() {

        if (flowName == null) {
            flowName = project.hasProperty("flowName") ? project.property("flowName") : null
        }
        if (flowName == null) {
            throw new FlowNameRequiredException()
        }

        def runFlowString = new StringBuffer("Running Flow: [" + flowName + "]")

        if (jobId == null) {
            jobId = project.hasProperty("jobId") ? project.property("jobId") : null
        }

        if (batchSize == null) {
            batchSize = project.hasProperty("batchSize") ?
                Integer.parseInt(project.property("batchSize")) : null
        }

        if (threadCount == null) {
            threadCount = project.hasProperty("threadCount") ?
                Integer.parseInt(project.property("threadCount")) : null
        }

        if (inputFilePath == null || inputFilePath.isAllWhitespace()) {
            inputFilePath ==  project.hasProperty("inputFilePath") ?
                project.property("inputFilePath") : null
        }

        if (inputFileType == null || inputFileType.isAllWhitespace()) {
            inputFileType ==  project.hasProperty("inputFileType") ?
                project.property("inputFileType") : null
        }

        if (outputURIReplacement == null || outputURIReplacement.isAllWhitespace()) {
            outputURIReplacement ==  project.hasProperty("outputURIReplacement") ?
                project.property("outputURIReplacement") : null
        }

        if (showOptions == null) {
            showOptions = project.hasProperty("showOptions") ?
                Boolean.parseBoolean(project.property("showOptions")) : false
        }

        if (failHard == null) {
            failHard = project.hasProperty("failHard") ?
                Boolean.parseBoolean(project.property("failHard")) : false
        }

        if (steps == null) {
            steps = project.hasProperty("steps") ?
                project.property("steps").toString().trim().tokenize(",") : null
        }

        if(steps != null) {
            runFlowString.append(", Steps: [" + steps.join(",") + "]")
        }

        if (!isHubInstalled()) {
            throw new HubNotInstalledException()
        }

        FlowManager fm = getFlowManager()
        Flow flow = fm.getFlow(flowName)
        if (flow == null) {
            throw new FlowNotFoundException(flowName)
        }

        Map<String, Object> options = new HashMap<>()
        def optionsString;
        if(project.ext.properties.containsKey("optionsFile")){
            def jsonFile = new File(project.ext.optionsFile)
            optionsString = jsonFile.text
        }
        else if(project.ext.properties.containsKey("options")) {
            optionsString = String.valueOf(project.ext.options)
        }
        if (optionsString?.trim()) {
            ObjectMapper mapper = new ObjectMapper();
            options = mapper.readValue(optionsString,
                new TypeReference<Map<String, Object>>() {
                });
        }

        Map<String, Object> stepConfig = new HashMap<>()

        if(batchSize != null){
            runFlowString.append("\n\twith batch size: " + batchSize)
            stepConfig.put("batchSize", batchsize)
        }
        if(threadCount != null){
            runFlowString.append("\n\twith thread count: " + threadCount)
            stepConfig.put("threadCount", batchSize)
        }

        if(inputFileType != null || inputFilePath != null || outputURIReplacement != null){
            runFlowString.append("\n\tWith File Locations Settings:")
            Map<String, String> fileLocations = new HashMap<>()
            if(inputFileType != null) {
                runFlowString.append("\n\t\tInput File Type:" + inputFileType.toString())
                fileLocations.put("inputFileType", inputFilePath)
            }
            if(inputFilePath != null) {
                runFlowString.append("\n\t\tInput File Path:" + inputFilePath.toString())
                fileLocations.put("inputFilePath", inputFilePath)
            }
            if(outputURIReplacement != null) {
                runFlowString.append("\n\t\tOutput URI Replacement:" + outputURIReplacement.toString())
                fileLocations.put("outputURIReplacement", outputURIReplacement)
            }
            stepConfig.put("fileLocations", fileLocations)
        }
        if (showOptions) {
            runFlowString.append("\n\tand options:")
            options.each { key, value ->
                runFlowString.append("\n\t\t" + key + " = " + value)
            }
        }

        // now we print out the string buffer
        println(runFlowString.toString())

        RunFlowResponse runFlowResponse = dataHub.getFlowRunner().runFlow(flow.getName(), steps, jobId, options, stepConfig)
        dataHub.getFlowRunner().awaitCompletion()

        JsonBuilder jobResp = new JsonBuilder(runFlowResponse)
        println("\n\nOutput:")
        println(jobResp.toPrettyString())
    }
}
