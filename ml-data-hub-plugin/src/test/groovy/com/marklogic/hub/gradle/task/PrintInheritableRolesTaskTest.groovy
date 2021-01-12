package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.BaseTest
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class PrintInheritableRolesTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def "simple smoke test"() {
        when:
        def result
        result = runTask("hubPrintInheritableRoles")

        then:
        notThrown(UnexpectedBuildFailure)
        result.output.contains("The following DHF and MarkLogic roles can be inherited by a custom role")
        result.output.contains("data-hub-common")
        result.task(":hubPrintInheritableRoles").outcome == SUCCESS
    }
}
