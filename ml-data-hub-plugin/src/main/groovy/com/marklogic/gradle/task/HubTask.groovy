package com.marklogic.gradle.task

import com.marklogic.hub.DataHub;
import com.marklogic.hub.Tracing;
import com.marklogic.hub.HubConfig;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;

import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;

import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

class HubTask extends DefaultTask {

    HubConfig getHubConfig() {
        getProject().property("hubConfig")
    }

    DataHub getDataHub() {
        getProject().property("dataHub")
    }

    Tracing getTracing() {
        return new Tracing(getStagingClient())
    }

    Tracing getDebugging() {
        return new Tracing(getStagingClient())
    }

    FlowManager getFlowManager() {
        return new FlowManager(getStagingClient())
    }

    DatabaseClient getStagingClient() {
        HubConfig hc = getHubConfig()
        Authentication authMethod = Authentication.valueOf(hc.authMethod.toUpperCase())
        return DatabaseClientFactory.newClient(
                hc.host,
                hc.stagingPort,
                hc.adminUsername,
                hc.adminPassword,
                authMethod);
    }
}
