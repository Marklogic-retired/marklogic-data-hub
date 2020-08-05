package com.marklogic.gradle.task


import org.gradle.testkit.runner.UnexpectedBuildFailure

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

/*
Smoke tests to make sure the tasks run fine
 */
class AddStepToFlowTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        runTask('hubCreateStep', '-PstepName=myIngestion', '-PstepType=ingestion')
        runTask('hubCreateFlow', '-PflowName=myFlow')
        runTask('hubDeployUserArtifacts')
    }

    def "missing flow name"() {
        given:
        propertiesFile << """
            ext {
                stepName=myIngestion
                stepType=ingestion
            }
        """

        when:
        def result = runFailTask('hubAddStepToFlow')

        then:
        result.task(":hubAddStepToFlow").outcome == FAILED
    }

    def "add step to flow"() {
        given:
        propertiesFile << """
            ext {
                stepName=myIngestion
                stepType=ingestion
                flowName=myFlow
            }
        """

        when:
        def result = runTask('hubAddStepToFlow', '--stacktrace')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubAddStepToFlow").outcome == SUCCESS
    }
}
