package com.marklogic.gradle.task

import com.marklogic.hub.Debugging
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class EnableDebuggingTaskTest extends BaseTest {

    def "enable debugging hub not installed"() {
        when:
        def result = runFailTask('hubEnableDebugging')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Data Hub is not installed')
        result.task(":hubEnableDebugging").outcome == FAILED

    }

    def "enable debugging with hub installed"() {
        setup: "init the project"
            runTask('hubInit')

        and: 'deploy to marklogic'
            runTask('mlDeploy')

        when:
            def result = runTask('hubEnableDebugging')

        then:
            notThrown(UnexpectedBuildFailure)
            result.task(":hubEnableDebugging").outcome == SUCCESS
            Debugging d = new Debugging(stagingClient())
            d.isEnabled() == true

        cleanup: "uninstall the hub"
            runTask('mlUndeploy')
    }
}
