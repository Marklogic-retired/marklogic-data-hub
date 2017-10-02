package com.marklogic.gradle.task

import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class CreateHarmonizeFlowTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
    }

    def "createHarmonizeFlow with no entityName"() {
        when:
        def result = runFailTask('hubCreateHarmonizeFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('entityName property is required')
        result.task(":hubCreateHarmonizeFlow").outcome == FAILED
    }

    def "createHarmonizeFlow with no flowName"() {
        given:
        propertiesFile << """
            ext {
                entityName=my-new-entity
            }
        """

        when:
        def result = runFailTask('hubCreateHarmonizeFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('flowName property is required')
        result.task(":hubCreateHarmonizeFlow").outcome == FAILED
    }

    def "createHarmonizeFlow with valid name"() {
        given:
        propertiesFile << """
            ext {
                entityName=my-new-entity
                flowName=my-new-harmonize-flow
            }
        """

        when:
        def result = runTask('hubCreateHarmonizeFlow')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateHarmonizeFlow").outcome == SUCCESS

        File entityDir = Paths.get(testProjectDir.root.toString(), "plugins", "entities", "my-new-entity", "harmonize", "my-new-harmonize-flow").toFile()
        entityDir.isDirectory() == true
    }
}
