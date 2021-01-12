package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.BaseTest
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class DescribeRoleTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def "simple smoke test"() {
        when:
        def result
        result = runTask("hubDescribeRole", '-Prole=data-hub-developer')

        then:
        notThrown(UnexpectedBuildFailure)
        result.output.contains("markLogicVersion")
        result.task(":hubDescribeRole").outcome == SUCCESS
    }

    def "no role specified"() {
        when:
        def result = runFailTask('hubDescribeRole')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Please specify a role via -Prole=(name of MarkLogic role to describe)')
        result.task(":hubDescribeRole").outcome == FAILED
    }
}
