package com.marklogic.gradle.task


import com.marklogic.hub.impl.VersionInfo
import org.gradle.api.tasks.TaskAction

class HubVersionTask extends HubTask {

    @TaskAction
    void getHubVersion() {
        VersionInfo versionInfo = VersionInfo.newVersionInfo(getHubConfig().newHubClient())
        println "Version information is displayed below. The 'Data Hub version' refers to the version of Data Hub that "
        println "is installed in the given host, while 'Data Hub client version' refers to the version of the Data Hub "
        println "client library used by this Gradle task. These two version should match in order to ensure proper behavior "
        println "of the Gradle tasks that you run. "
        println ""
        println "           Data Hub host: " + getHubConfig().getHost()
        println "       MarkLogic version: " + versionInfo.getMarkLogicVersion()
        println "        Data Hub version: " + versionInfo.getHubVersion()
        println " Data Hub client version: " + VersionInfo.getBuildVersion()
    }
}
