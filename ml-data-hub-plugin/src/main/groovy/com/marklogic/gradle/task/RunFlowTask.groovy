package com.marklogic.gradle.task

import com.marklogic.client.DatabaseClient
import com.marklogic.gradle.exception.EntityNameRequiredException
import com.marklogic.gradle.exception.FlowNameRequiredException
import com.marklogic.gradle.exception.FlowNotFoundException
import com.marklogic.gradle.exception.HubNotInstalledException
import com.marklogic.hub.FlowManager
import com.marklogic.hub.HubDatabase
import com.marklogic.hub.flow.Flow
import com.marklogic.hub.flow.FlowRunner
import com.marklogic.hub.flow.FlowType
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

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
        if (sourceDB == null) {
            if (project.hasProperty("sourceDB")) {
                sourceClient = hubConfig.newStagingClient()
                sourceClient.database = project.property("sourceDB")
            }
            else {
                sourceClient = hubConfig.newStagingClient()
            }
        }
        if (destDB == null) {
            destDB = project.hasProperty("destDB") ?
                project.property("destDB") : hubConfig.finalDbName
        }
        if (showOptions == null) {
            showOptions = project.hasProperty("showOptions") ?
                Boolean.parseBoolean(project.property("showOptions")) : false
        }

        if (!isHubInstalled()) {
            throw new HubNotInstalledException()
        }

        FlowManager fm = getFlowManager()
        Flow flow = fm.getFlow(entityName, flowName, FlowType.HARMONIZE)
        if (flow == null) {
            throw new FlowNotFoundException(entityName, flowName);
        }

        Map<String, Object> options = new HashMap<>()
        project.ext.properties.each { key, value ->
            if (key.toString().startsWith("dhf.")) {
                options.put(key, value)
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

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withOptions(options)
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .withSourceClient(sourceClient)
            .withDestinationDatabase(destDB)
        flowRunner.run()
        flowRunner.awaitCompletion()
    }
}
