package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.BaseTest
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class GenerateTestSuiteTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def "happy path"() {
        when:
        def result = runTask("hubGenerateTestSuite", '-PsuiteName=mySuite')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubGenerateTestSuite").outcome == SUCCESS
        result.output.contains("Generated the following files:")
        result.output.contains("src/main/ml-modules/root/test/suites/mySuite/suiteSetup.sjs")
        result.output.contains("src/main/ml-modules/root/test/suites/mySuite/setup.sjs")
        result.output.contains("src/main/ml-modules/root/test/suites/mySuite/test.sjs")
    }

    def "custom test name"() {
        when:
        def result = runTask("hubGenerateTestSuite", '-PsuiteName=mySuite', '-PtestName=myCustomTest')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubGenerateTestSuite").outcome == SUCCESS
        result.output.contains("Generated the following files:")
        result.output.contains("src/main/ml-modules/root/test/suites/mySuite/suiteSetup.sjs")
        result.output.contains("src/main/ml-modules/root/test/suites/mySuite/setup.sjs")
        result.output.contains("src/main/ml-modules/root/test/suites/mySuite/myCustomTest.sjs")
    }

    def "custom source path"() {
        when:
        def result = runTask("hubGenerateTestSuite", '-PsuiteName=mySuite', '-PsourcePath=build/test-hubGenerateTestSuite')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubGenerateTestSuite").outcome == SUCCESS
        result.output.contains("Generated the following files:")
        result.output.contains("build/test-hubGenerateTestSuite/root/test/suites/mySuite/suiteSetup.sjs")
        result.output.contains("build/test-hubGenerateTestSuite/root/test/suites/mySuite/setup.sjs")
        result.output.contains("build/test-hubGenerateTestSuite/root/test/suites/mySuite/test.sjs")
    }

    def "no suiteName specified"() {
        when:
        def result = runFailTask('hubGenerateTestSuite')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.task(":hubGenerateTestSuite").outcome == FAILED
        result.output.contains('Please specify a suite name via -PsuiteName=nameOfTestSuite')
    }
}
