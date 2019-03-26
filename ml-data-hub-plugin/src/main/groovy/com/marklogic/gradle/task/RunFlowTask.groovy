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
import com.marklogic.gradle.exception.FlowNotFoundException
import com.marklogic.gradle.exception.HubNotInstalledException
import com.marklogic.hub.FlowManager
import com.marklogic.hub.flow.Flow
import com.marklogic.hub.flow.RunFlowResponse
import groovy.json.*
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
    public String sourceDB

    @Input
    public String destDB

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

        if (sourceDB == null || sourceDB.isAllWhitespace()) {
            sourceDB ==  project.hasProperty("sourceDB") ?
                project.property("sourceDB") : null
        }

        if (destDB == null) {
            destDB = project.hasProperty("destDB") ?
                project.property("destDB") : null
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
        def jsonSlurper = new JsonSlurper(type: JsonParserType.INDEX_OVERLAY)
        if(project.ext.properties.containsKey("optionsFile")){
            def jsonFile = new File(project.ext.optionsFile)
            options = jsonSlurper.parseText(jsonFile.text)
        }
        else if(project.ext.properties.containsKey("options")) {
            def optionsString = String.valueOf(project.ext.options)
            options = jsonSlurper.parseText(optionsString)
        }

        if(batchSize != null){
            runFlowString.append("\n\twith batch size: " + batchSize)
        }
        if(threadCount != null){
            runFlowString.append("\n\twith thread count: " + threadCount)
        }
        if(sourceDB != null){
            runFlowString.append("\n\twith Source DB: " + sourceDB)
        }
        if(destDB != null){
            runFlowString.append("\n\twith Destination DB: " + destDB.toString())
        }
        if (showOptions) {
            runFlowString.append("\tand options:")
            options.each { key, value ->
                runFlowString.append("\t\t" + key + " = " + value)
            }
        }

        // now we print out the string buffer
        println(runFlowString.toString())

        RunFlowResponse runFlowResponse = dataHub.getFlowRunner().runFlow(flow.getName(), steps, jobId, options, batchSize, threadCount, sourceDB, destDB)
        dataHub.getFlowRunner().awaitCompletion()

        JsonBuilder jobResp = new JsonBuilder(runFlowResponse)
        println("\n\nOutput:")
        println(jobResp.toPrettyString())
    }
}
