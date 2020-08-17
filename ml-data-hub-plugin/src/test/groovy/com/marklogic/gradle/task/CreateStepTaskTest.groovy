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

    def "create ingestion step"() {
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

    def "create mapping step without entity type"() {
        given:
        propertiesFile << """
            ext {
                stepName=myMap
                stepType=mapping
            }
        """

        when:
        def result = runFailTask('hubCreateStep')

        then:
        result.task(":hubCreateStep").outcome == FAILED
    }

    def "create custom step"() {
        given:
        propertiesFile << """
            ext {
                stepName=myCustomStep
                stepType=custom
            }
        """

        when:
        def result = runTask('hubCreateStep')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateStep").outcome == SUCCESS
    }

    def "create matching step"() {
        given:
        propertiesFile << """
            ext {
                stepName=myMatchStep
                stepType=matching
            }
        """

        when:
        def result = runTask('hubCreateStep')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateStep").outcome == SUCCESS
    }

    def "create merging step"() {
        given:
        propertiesFile << """
            ext {
                stepName=myMergeStep
                stepType=merging
            }
        """

        when:
        def result = runTask('hubCreateStep')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateStep").outcome == SUCCESS
    }

    def "create mastering step"() {
        given:
        propertiesFile << """
            ext {
                stepName=myMaster
                stepType=mastering
            }
        """

        when:
        def result = runFailTask('hubCreateStep')

        then:
        result.task(":hubCreateStep").outcome == FAILED
    }
}
