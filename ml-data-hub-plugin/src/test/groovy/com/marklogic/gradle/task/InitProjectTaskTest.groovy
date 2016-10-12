package com.marklogic.gradle.task

import org.gradle.testkit.runner.UnexpectedBuildFailure

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class InitProjectTaskTest extends BaseTest {
    def "enable tracing with hub installed"() {

        when: "we begin"
            File entityDir = new File(testProjectDir.root, "plugins")
            File mlConfigDir = new File(testProjectDir.root, "marklogic-config")
        then:
            entityDir.isDirectory() == false
            mlConfigDir.isDirectory() == false

        when:
        def result = runTask('hubInit')

        then:
            notThrown(UnexpectedBuildFailure)
            result.task(":hubInit").outcome == SUCCESS
            entityDir.isDirectory() == true
            mlConfigDir.isDirectory() == true

    }
}
