package com.marklogic.gradle.task

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.marklogic.appdeployer.command.CommandContext
import com.marklogic.client.DatabaseClient
import com.marklogic.hub.*
import org.gradle.api.DefaultTask

abstract class HubTask extends DefaultTask {

    HubConfig getHubConfig() {
        getProject().property("hubConfig")
    }

    DataHub getDataHub() {
        getProject().property("dataHub")
    }

    Tracing getTracing() {
        return new Tracing(getStagingClient())
    }

    Debugging getDebugging() {
        return new Debugging(getStagingClient())
    }

    FlowManager getFlowManager() {
        return new FlowManager(getHubConfig())
    }

    DatabaseClient getStagingClient() {
        return getHubConfig().newStagingClient()
    }

    DatabaseClient getFinalClient() {
        return getHubConfig().newFinalClient()
    }

    CommandContext getCommandContext() {
        getProject().property("mlCommandContext")
    }

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
