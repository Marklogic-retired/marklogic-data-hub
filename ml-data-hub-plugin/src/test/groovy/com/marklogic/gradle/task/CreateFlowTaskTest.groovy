package com.marklogic.gradle.task

import com.marklogic.client.DatabaseClient
import com.marklogic.hub.HubConfig
import groovy.json.JsonSlurper
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class CreateFlowTaskTest extends BaseTest {
    DatabaseClient stagingClient

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def setup(){
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME)
        if (stagingClient == null){
            stagingClient = hubConfig().newHubClient().stagingClient
        }
    }

    def "create flow with no name"() {
        when:
        def result = runFailTask('hubCreateFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('flowName property is required')
        result.task(":hubCreateFlow").outcome == FAILED
    }

    def "create default empty flow"() {
        given:
        propertiesFile << """
            ext {
                flowName=mySimpleFlow
            }
        """

        when:
        def result = runTask('hubCreateFlow')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateFlow").outcome == SUCCESS

        File flowDir = Paths.get(testProjectDir.root.toString(), "flows").toFile()
        flowDir.isDirectory()
        def jsonSlurper = new JsonSlurper()
        def data = jsonSlurper.parse(Paths.get(testProjectDir.root.toString(), "flows", "mySimpleFlow.flow.json").toFile());
        data.name == "mySimpleFlow"
        data.description == "Flow description"
        stagingClient.newServerEval().javascript("fn.head(cts.doc(\"/flows/mySimpleFlow.flow.json\"))").eval().hasNext()
    }

    def "create flow with inline steps"() {
        given:
        propertiesFile << """
            ext {
                flowName=myTestFlow
                withInlineSteps=true
            }
        """

        when:
        def result = runTask('hubCreateFlow')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateFlow").outcome == SUCCESS

        File flowDir = Paths.get(testProjectDir.root.toString(), "flows").toFile()
        flowDir.isDirectory()
        def jsonSlurper = new JsonSlurper()
        def data = jsonSlurper.parse(Paths.get(testProjectDir.root.toString(), "flows", "myTestFlow.flow.json").toFile());
        def expectedPermissions = 'data-hub-common,read,data-hub-common,update'
        data.steps.'1'.name == 'ingestion-step'
        data.steps.'1'.options.permissions == expectedPermissions
        data.steps.'2'.name == 'mapping-step'
        data.steps.'2'.options.permissions == expectedPermissions
        data.steps.'3'.name == 'matching-step'
        data.steps.'3'.options.permissions == expectedPermissions
        data.steps.'4'.name == 'merging-step'
        data.steps.'4'.options.permissions == expectedPermissions
        stagingClient.newServerEval().javascript("fn.head(cts.doc(\"/flows/myTestFlow.flow.json\"))").eval().hasNext()
    }

    def "create flow with existing name"() {
        given:
        propertiesFile << """
            ext {
                flowName=myDuplicateFlow
            }
        """

        when:
        runTask('hubCreateFlow')
        def failedResult = runFailTask('hubCreateFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        failedResult.output.contains("A flow with a name of \'myDuplicateFlow\' already exists")
        failedResult.task(":hubCreateFlow").outcome == FAILED
    }
}
