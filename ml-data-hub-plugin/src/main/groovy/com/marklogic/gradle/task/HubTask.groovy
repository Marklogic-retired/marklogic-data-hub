package com.marklogic.gradle.task

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

    CommandContext getCommandContext() {
        getProject().property("mlCommandContext")
    }

    boolean isHubInstalled() {
        InstallInfo installInfo = getDataHub().isInstalled();
        return installInfo.isInstalled();
    }
}
