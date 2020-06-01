package com.marklogic.gradle.task


import org.gradle.testkit.runner.UnexpectedBuildFailure

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

// The order of the tests appears to matter, as the test plumbing isn't wiping out the propertiesFile after
// each test :(
class CreateStepTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def "missing type"() {
        given:
        propertiesFile << """
            ext {
                stepName=myStep
            }
        """

        when:
        def result = runFailTask('hubCreateStep')

        then:
        result.task(":hubCreateStep").outcome == FAILED
    }

    def "create any valid step"() {
        given:
        propertiesFile << """
            ext {
                stepName=myIngester
                stepType=ingestion
            }
        """

        when:
        def result = runTask('hubCreateStep')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateStep").outcome == SUCCESS
    }

    def "missing name"() {
        given:
        propertiesFile << """
            ext {
                stepType=ingestion
            }
        """

        when:
        def result = runFailTask('hubCreateStep')

        then:
        result.task(":hubCreateStep").outcome == FAILED
    }
}
