package com.marklogic.gradle.task

import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class CreateInputFlowTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
    }

    def "createInputFlow with no entityName"() {
        when:
        def result = runFailTask('hubCreateInputFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('entityName property is required')
        result.task(":hubCreateInputFlow").outcome == FAILED
    }

    def "createInputFlow with no flowName"() {
        given:
        propertiesFile << """
            ext {
                entityName=my-new-entity
            }
        """

        when:
        def result = runFailTask('hubCreateInputFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('flowName property is required')
        result.task(":hubCreateInputFlow").outcome == FAILED
    }

    def "createInputFlow with valid name"() {
        given:
        propertiesFile << """
            ext {
                entityName=my-new-entity
                flowName=my-new-harmonize-flow
            }
        """

        when:
        def result = runTask('hubCreateInputFlow')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateInputFlow").outcome == SUCCESS

        File entityDir = Paths.get(testProjectDir.root.toString(), "plugins", "entities", "my-new-entity", "input", "my-new-harmonize-flow").toFile()
        entityDir.isDirectory() == true
    }
}
