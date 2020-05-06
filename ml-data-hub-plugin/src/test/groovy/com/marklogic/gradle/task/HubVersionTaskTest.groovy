package com.marklogic.gradle.task

import org.gradle.testkit.runner.UnexpectedBuildFailure
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class HubVersionTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def "run hubVersion"() {
        when:
        def result
        result = runTask("hubVersion")

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubVersion").outcome == SUCCESS
        // This is a smoke test to verify an error is not thrown; printing the output for manual inspection
        println "Output of hubVersion task: " + result.output
    }
}
