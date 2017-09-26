package com.marklogic.gradle.task

import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class CreateEntityTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
    }

    def "create entity with no name"() {
        when:
        def result = runFailTask('hubCreateEntity')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('entityName property is required')
        result.task(":hubCreateEntity").outcome == FAILED
    }

    def "create entity with valid name"() {
        given:
        propertiesFile << """
            ext {
                entityName=my-new-entity
            }
        """

        when:
        def result = runTask('hubCreateEntity')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateEntity").outcome == SUCCESS

        File entityDir = Paths.get(testProjectDir.root.toString(), "plugins", "entities", "my-new-entity").toFile()
        entityDir.isDirectory() == true
    }

}
