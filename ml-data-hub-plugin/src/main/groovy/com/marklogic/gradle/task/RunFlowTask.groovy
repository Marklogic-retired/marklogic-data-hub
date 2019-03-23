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

import com.marklogic.client.DatabaseClient
import com.marklogic.gradle.exception.FlowNameRequiredException
import com.marklogic.gradle.exception.FlowNotFoundException
import com.marklogic.gradle.exception.HubNotInstalledException
import com.marklogic.hub.FlowManager
import com.marklogic.hub.flow.Flow
import com.marklogic.hub.flow.FlowRunner
import com.marklogic.hub.step.StepItemCompleteListener
import com.marklogic.hub.step.StepItemFailureListener
import com.marklogic.hub.step.StepRunner
import com.marklogic.hub.job.Job
import groovy.json.JsonBuilder
import groovy.json.JsonParserType
import groovy.json.JsonSlurper
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction
import org.gradle.api.tasks.TaskExecutionException

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

        if (jobId == null) {
            jobId = project.hasProperty("jobId") ? project.property("jobId") : null
        }

        if (batchSize == null) {
            batchSize = project.hasProperty("batchSize") ?
                Integer.parseInt(project.property("batchSize")) : 200
        }

        if (threadCount == null) {
            threadCount = project.hasProperty("threadCount") ?
                Integer.parseInt(project.property("threadCount")) : 4
        }

        DatabaseClient sourceClient = null

        if (sourceDB != null && !sourceDB.isAllWhitespace()) {
            sourceClient = hubConfig.newStagingClient(sourceDB)
        } else if (project.hasProperty("sourceDB")) {
            sourceClient = hubConfig.newStagingClient(project.property("sourceDB"))
        } else {
            sourceClient = hubConfig.newStagingClient()
        }

        if (destDB == null) {
            destDB = project.hasProperty("destDB") ?
                project.property("destDB") : hubConfig.finalDbName
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

        println("Running Flow: [" + flowName + "], Steps: [" + steps.join(",") + "]" +
            "\n\twith batch size: " + batchSize +
            "\n\twith thread count: " + threadCount +
            "\n\twith Source DB: " + sourceClient.database +
            "\n\twith Destination DB: " + destDB.toString())

        if (showOptions) {
            println("\tand options:")
            options.each { key, value ->
                println("\t\t" + key + " = " + value)
            }
        }

        FlowRunner flowRunner = dataHub.getFlowRunner().runFlow(flow, steps)
            .withOptions(options)
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .withSourceClient(sourceClient)
            .withDestinationDatabase(destDB)
            .withJobId(jobId)
            .onItemComplete(new StepItemCompleteListener() {
                @Override
                void processCompletion(String jobId, String itemId) {
                    //TODO in the future, let's figure out a good use of this space
                }
            })
            .onItemFailed(new StepItemFailureListener() {
                @Override
                void processFailure(String jobId, String itemId) {
                    //TODO ditto
                }
            })
        Job job = flowRunner.run()
        flowRunner.awaitCompletion()

        JsonBuilder jobResp = new JsonBuilder(job)
        def jobOutput = job.jobOutput
        if (jobOutput != null && jobOutput.size() > 0) {
            def output = prettyPrint(jobOutput.get(0))
            if (failHard) {
                throw new TaskExecutionException(this, new Throwable(output))
            } else {
                println("\n\nERROR Output:")
                println(output)
            }

        } else {
            println("\n\nOutput:")
            println(jobResp.toPrettyString())
        }
    }
}
