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
import com.marklogic.client.datamovement.JobTicket
import com.marklogic.client.io.JacksonHandle
import com.marklogic.gradle.exception.EntityNameRequiredException
import com.marklogic.gradle.exception.FlowNameRequiredException
import com.marklogic.gradle.exception.FlowNotFoundException
import com.marklogic.gradle.exception.HubNotInstalledException
import com.marklogic.hub.legacy.LegacyFlowManager
import com.marklogic.hub.legacy.flow.LegacyFlowItemCompleteListener
import com.marklogic.hub.legacy.flow.LegacyFlowItemFailureListener
import com.marklogic.hub.legacy.flow.LegacyFlowRunner
import com.marklogic.hub.legacy.flow.FlowType
import com.marklogic.hub.legacy.flow.LegacyFlow
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction
import org.gradle.api.tasks.TaskExecutionException

class RunLegacyFlowTask extends HubTask {

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

    @TaskAction
    void runFlow() {
        if (entityName == null) {
            entityName = project.hasProperty("entityName") ? project.property("entityName") : null
        }
        if (entityName == null) {
            throw new EntityNameRequiredException()
        }
        if (flowName == null) {
            flowName = project.hasProperty("flowName") ? project.property("flowName") : null
        }
        if (flowName == null) {
            throw new FlowNameRequiredException()
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
        }
        else if (project.hasProperty("sourceDB")) {
            sourceClient = hubConfig.newStagingClient(project.property("sourceDB"))
        }
        else {
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

        if (!isHubInstalled()) {
            throw new HubNotInstalledException()
        }

        LegacyFlowManager fm = getLegacyFlowManager()
        LegacyFlow flow = fm.getFlow(entityName, flowName, FlowType.HARMONIZE)
        if (flow == null) {
            throw new FlowNotFoundException(entityName, flowName);
        }

        Map<String, Object> options = new HashMap<>()
        project.ext.properties.each { key, value ->
            if (key.toString().startsWith("dhf.")) {
                options.put(key.minus("dhf."), value)
            }
        }
        println("Running Flow: [" + entityName + ":" + flowName + "]" +
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

        LegacyFlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withOptions(options)
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .withSourceClient(sourceClient)
            .withDestinationDatabase(destDB)
            .onItemComplete(new LegacyFlowItemCompleteListener() {
                @Override
                void processCompletion(String jobId, String itemId) {
                    //TODO in the future, let's figure out a good use of this space
                }
            })
            .onItemFailed(new LegacyFlowItemFailureListener() {
                @Override
                void processFailure(String jobId, String itemId) {
                    //TODO ditto
                }
            })
        JobTicket jobTicket = flowRunner.run()
        flowRunner.awaitCompletion()

        def jobDocMgr = getHubConfig().newJobDbClient().newDocumentManager()
        def job = jobDocMgr.read("/jobs/" + jobTicket.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        def jobOutput = job.get("jobOutput")
        if (jobOutput != null && jobOutput.size() > 0) {
            def output = prettyPrint(jobOutput.get(0).asText())
            if (failHard) {
                throw new TaskExecutionException(this, new Throwable(output))
            }
            else {
                println("\n\nERROR Output:")
                println(output)
            }

        }
        else {
            println("\n\nOutput:")
            println(prettyPrint(job))
        }
    }
}
