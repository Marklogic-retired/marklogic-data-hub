package com.marklogic.gradle.task

import com.marklogic.hub.Tracing
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class DisableTracingTaskTest extends BaseTest {
    def "disable tracing hub not installed"() {
        when:
        def result = runFailTask('hubDisableTracing')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Data Hub is not installed')
        result.task(":hubDisableTracing").outcome == FAILED

    }

    def "disable tracing with hub installed"() {
        setup: "init the project"
        runTask('hubInit')

        and: 'deploy to marklogic'
        runTask('mlDeploy')

        when:
        def result = runTask('hubDisableTracing')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubDisableTracing").outcome == SUCCESS
        Tracing t = new Tracing(stagingClient())
        t.isEnabled() == false

        cleanup: "uninstall the hub"
        runTask('mlUndeploy')
    }
}
