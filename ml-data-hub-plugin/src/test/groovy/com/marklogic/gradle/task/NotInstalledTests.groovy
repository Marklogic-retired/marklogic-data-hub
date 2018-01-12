package com.marklogic.gradle.task

import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED

class NotInstalledTests extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        runTask('mlUndeploy',  '-Pconfirm=true')
    }

    def "enable debugging hub not installed"() {
        when:
        def result = runFailTask('hubEnableDebugging')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Data Hub is not installed')
        result.task(":hubEnableDebugging").outcome == FAILED
    }

    def "disable debugging hub not installed"() {
        when:
        def result = runFailTask('hubDisableDebugging')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Data Hub is not installed')
        result.task(":hubDisableDebugging").outcome == FAILED
    }

    def "test run flow with no entity"() {
        when:
        def result = runFailTask('hubRunFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('entityName property is required')
        result.task(":hubRunFlow").outcome == FAILED
    }

    def "test run flow with no flow"() {
        given:
        propertiesFile << """
            ext {
                entityName=my-entity
            }
        """

        when:
        def result = runFailTask('hubRunFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('flowName property is required')
        result.task(":hubRunFlow").outcome == FAILED
    }

    def "test run flow when hub not installed"() {
        given:
        propertiesFile << """
                ext {
                    entityName=my-entity
                    flowName=my-flow
                }
            """

        when:
        def result = runFailTask('hubRunFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Data Hub is not installed')
        result.task(":hubRunFlow").outcome == FAILED
    }

}
