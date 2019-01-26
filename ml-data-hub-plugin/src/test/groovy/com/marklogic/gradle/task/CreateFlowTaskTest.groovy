package com.marklogic.gradle.task

import com.marklogic.hub.HubConfig
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class CreateFlowTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    def "create flow with no name"() {
        when:
        def result = runFailTask('hubCreateFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('flowName property is required')
        result.task(":hubCreateFlow").outcome == FAILED
    }

    def "create flow with valid name only"() {
        given:
        propertiesFile << """
            ext {
                flowName=myTestFlow
            }
        """

        when:
        def result = runTask('hubCreateFlow')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateFlow").outcome == SUCCESS

        File flowDir = Paths.get(testProjectDir.root.toString(), "flows").toFile()
        flowDir.isDirectory()
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
        failedResult.output.contains('Flow with the same name is already present')
        failedResult.task(":hubCreateFlow").outcome == FAILED
    }
}
