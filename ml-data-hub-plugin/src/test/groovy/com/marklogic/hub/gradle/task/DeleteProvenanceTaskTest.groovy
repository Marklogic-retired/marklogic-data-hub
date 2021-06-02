package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.BaseTest
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class DeleteProvenanceTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def "simple smoke test"() {
        when:
        def result
        result = runTask("hubDeleteProvenance", '-PretainDuration=P30D')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubDeleteProvenance").outcome == SUCCESS
    }

    def "no duration specified"() {
        when:
        def result = runFailTask('hubDeleteProvenance')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Please specify a duration via -PretainDuration')
        result.task(":hubDeleteProvenance").outcome == FAILED
    }
}
