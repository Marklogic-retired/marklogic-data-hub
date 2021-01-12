package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.BaseTest
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class DescribeUserTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def "simple smoke test"() {
        when:
        def result
        result = runTask("hubDescribeUser", '-Puser=test-data-hub-developer')

        then:
        notThrown(UnexpectedBuildFailure)
        result.output.contains("markLogicVersion")
        result.task(":hubDescribeUser").outcome == SUCCESS
    }

    def "no user specified"() {
        when:
        def result = runFailTask('hubDescribeUser')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Please specify a user via -Puser=(name of MarkLogic user to describe)')
        result.task(":hubDescribeUser").outcome == FAILED
    }
}
