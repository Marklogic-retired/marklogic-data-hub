package com.marklogic.gradle.task

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.marklogic.appdeployer.command.CommandContext
import com.marklogic.client.DatabaseClient
import com.marklogic.hub.*
import com.marklogic.hub.job.JobManager
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.Internal

abstract class HubTask extends DefaultTask {

    @Internal
    HubConfig getHubConfig() {
        getProject().property("hubConfig")
    }

    @Internal
    DataHub getDataHub() {
        getProject().property("dataHub")
    }

    @Internal
    Tracing getTracing() {
        return new Tracing(getStagingClient())
    }

    @Internal
    Debugging getDebugging() {
        return new Debugging(getStagingClient())
    }

    @Internal
    FlowManager getFlowManager() {
        return new FlowManager(getHubConfig())
    }

    @Internal
    JobManager getJobManager() {
        return new JobManager(getHubConfig().newJobDbClient());
    }

    @Internal
    DatabaseClient getStagingClient() {
        return getHubConfig().newStagingClient()
    }

    @Internal
    DatabaseClient getFinalClient() {
        return getHubConfig().newFinalClient()
    }

    @Internal
    CommandContext getCommandContext() {
        getProject().property("mlCommandContext")
    }

    @Internal
    boolean isHubInstalled() {
        InstallInfo installInfo = getDataHub().isInstalled();
        return installInfo.isInstalled();
    }

    String prettyPrint(str) {
        try {
            def jsonObject

            ObjectMapper mapper = new ObjectMapper()
            if (str instanceof JsonNode) {
                jsonObject = str
            }
            else {
                jsonObject = mapper.readValue(str, Object.class)
            }
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonObject)
        }
        catch(Exception e) {
            return str
        }

    }
}
