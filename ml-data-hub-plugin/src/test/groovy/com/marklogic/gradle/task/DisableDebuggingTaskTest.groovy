package com.marklogic.gradle.task

import com.marklogic.hub.Debugging
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class DisableDebuggingTaskTest extends BaseTest {
    def "disable debugging hub not installed"() {
        when:
        def result = runFailTask('hubDisableDebugging')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Data Hub is not installed')
        result.task(":hubDisableDebugging").outcome == FAILED

    }

    def "disable debugging with hub installed"() {
        setup: "init the project"
        runTask('hubInit')

        and: 'deploy to marklogic'
        runTask('mlDeploy')

        when:
        def result = runTask('hubDisableDebugging')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubDisableDebugging").outcome == SUCCESS
        Debugging d = new Debugging(stagingClient())
        d.isEnabled() == false

        cleanup: "uninstall the hub"
        runTask('mlUndeploy')
    }
}
