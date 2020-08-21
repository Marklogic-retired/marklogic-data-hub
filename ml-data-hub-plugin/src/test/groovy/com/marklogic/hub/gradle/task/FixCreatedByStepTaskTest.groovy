package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.BaseTest
import org.gradle.testkit.runner.UnexpectedBuildFailure

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class FixCreatedByStepTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def "simple smoke test"() {
        when:
        def result
        result = runTask("hubFixCreatedByStep", '-Pdatabase=data-hub-FINAL')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubFixCreatedByStep").outcome == SUCCESS
    }
}
