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
import com.marklogic.hub.step.StepItemCompleteListener
import com.marklogic.hub.step.StepItemFailureListener
import com.marklogic.hub.step.StepRunner
import com.marklogic.hub.job.Job
import groovy.json.JsonBuilder
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction
import org.gradle.api.tasks.TaskExecutionException

class RunFlowTask extends HubTask {

    @Input
    public String entityName

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
    public Integer step

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

        if (entityName == null) {
            entityName = project.hasProperty("entityName") ? project.property("entityName") : null
        }

        if (jobId == null) {
            jobId = project.hasProperty("jobId") ? project.property("jobId") : null
        }

        if (batchSize == null) {
            batchSize = project.hasProperty("batchSize") ?
                Integer.parseInt(project.property("batchSize")) : 100
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

        if (step == null) {
            step = project.hasProperty("step") ?
                Integer.parseInt(project.property("step")) : 1
        }

        if (!isHubInstalled()) {
            throw new HubNotInstalledException()
        }

        FlowManager fm = getFlowManager()
        Flow flow = fm.getFlow(flowName)
        if (flow == null) {
            throw new FlowNotFoundException(flowName);
        }

        Map<String, Object> options = new HashMap<>()
        project.ext.properties.each { key, value ->
            if (key.toString().startsWith("dhf.")) {
                options.put(key.minus("dhf."), value)
            }
        }
        println("Running Flow: [" + flowName + "], Step: [" + step + "]" +
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

        StepRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withStep(step)
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
