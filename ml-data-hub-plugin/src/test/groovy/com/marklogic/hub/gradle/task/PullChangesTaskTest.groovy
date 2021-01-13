package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.BaseTest
import com.marklogic.hub.HubConfig
import groovy.json.JsonSlurper
import spock.lang.Shared
import spock.lang.Stepwise

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

/*
Smoke test to ensure task runs as expected for users with and without "hub-central-downloader" role. More exhaustive tests
are GetProjectFilesAsZipTest and ApplyDownloadedZipToProjectTest
 */
@Stepwise
class PullChangesTaskTest extends BaseTest {

    @Shared
    File flowFile, entityFile

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        flowFile = hubConfig().getFlowsDir().resolve("myNewFlow.flow.json").toFile()
        entityFile = hubConfig().getHubEntitiesDir().resolve("person.entity.json").toFile()
        copyResourceToFile("master-test/person.entity.json", entityFile)
        copyResourceToFile("master-test/myNewFlow.flow.json",flowFile)
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
        runTask('hubDeployUserArtifacts')
    }

    def "running with user having hub-central-downloader role"() {
        long flowModifiedTime = flowFile.lastModified()
        long entitiesModifiedTime = entityFile.lastModified()
        def jsonSlurper = new JsonSlurper()

        given:
        propertiesFile << """mlUsername=test-data-hub-developer"""

        when:
        def result = runTask('hubPullChanges')

        then:
        result.task(":hubPullChanges").outcome == SUCCESS
        //The task has written these files and they are not old
        flowModifiedTime < flowFile.lastModified()
        entitiesModifiedTime < entityFile.lastModified()
        //'lastUpdated' property present in the downloaded file and not in original flow file
        jsonSlurper.parse(flowFile).lastUpdated != null
    }

    def "running with forbidden user"() {
        given:
        propertiesFile << """mlUsername=test-data-hub-operator"""

        when:
        def result = runFailTask('hubPullChanges')

        then:
        result.task(":hubPullChanges").outcome == FAILED
    }
}
