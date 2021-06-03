package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.BaseTest
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class DeleteJobsTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def "simple smoke test"() {
        when:
        // This is included because some other test in this suite is somehow removing the "timeEnded"
        // range index from the jobs database, thus causing this test to break.
        runTask('mlDeployDatabases')
        def result
        result = runTask("hubDeleteJobs", '-PretainDuration=P30D')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubDeleteJobs").outcome == SUCCESS
    }

    def "no duration specified"() {
        when:
        def result = runFailTask('hubDeleteJobs')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Please specify a duration via -PretainDuration')
        result.task(":hubDeleteJobs").outcome == FAILED
    }
}
