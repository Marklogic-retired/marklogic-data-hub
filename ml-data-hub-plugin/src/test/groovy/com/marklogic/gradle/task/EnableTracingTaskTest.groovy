package com.marklogic.gradle.task

import com.marklogic.hub.Tracing
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class EnableTracingTaskTest extends BaseTest {
    def "enable tracing hub not installed"() {
        when:
        def result = runFailTask('hubEnableTracing')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Data Hub is not installed')
        result.task(":hubEnableTracing").outcome == FAILED

    }

    def "enable tracing with hub installed"() {
        setup: "init the project"
        runTask('hubInit')

        and: 'deploy to marklogic'
        runTask('mlDeploy')

        when:
        def result = runTask('hubEnableTracing')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubEnableTracing").outcome == SUCCESS
        Tracing t = new Tracing(stagingClient())
        t.isEnabled() == true

        cleanup: "uninstall the hub"
        runTask('mlUndeploy')
    }
}
