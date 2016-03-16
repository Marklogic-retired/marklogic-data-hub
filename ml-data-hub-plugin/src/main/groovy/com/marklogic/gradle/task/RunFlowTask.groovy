package com.marklogic.gradle.task

import com.marklogic.hub.HubConfig;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;

import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

class RunFlowTask extends DefaultTask {

    @TaskAction
    void runFlow() {
        def entityName = project.hasProperty("entityName") ? project.property("entityName") : null
        if (entityName == null) {
            println "entityName property is required."
            return
        }
        def flowName = project.hasProperty("flowName") ? project.property("flowName") : null
        if (flowName == null) {
            println "flowName property is required."
            return
        }
        def flowType = project.hasProperty("flowType") ?
            FlowType.getFlowType(project.property("flowType")) : null

        def batchSize = project.hasProperty("batchSize") ?
            Integer.parseInt(project.property("batchSize")) : 100

        if (!getDataHub().isInstalled()) {
            println("Data Hub is not installed.")
            return
        }

        FlowManager fm = getFlowManager()
        Flow flow = fm.getFlow(entityName, flowName, flowType)
        if (flow) {
            println("Running Flow: [" + entityName + ":" + flowName + "] with batch size: " + batchSize)
            fm.runFlow(flow, batchSize)
        }
        else {
            println("Flow Not Found: [" + entityName + ":" + flowName + "]")
        }
    }

    HubConfig getHubConfig() {
        getProject().property("hubConfig")
    }

    DataHub getDataHub() {
        getProject().property("dataHub")
    }

    FlowManager getFlowManager() {
        HubConfig hc = getHubConfig()
        Authentication authMethod = Authentication.valueOf(hc.getAuthMethod().toUpperCase())
        DatabaseClient client = DatabaseClientFactory.newClient(
                hc.getHost(),
                hc.getStagingPort(),
                hc.getAdminUsername(),
                hc.getAdminPassword(),
                authMethod);
        return new FlowManager(client)
    }

}
