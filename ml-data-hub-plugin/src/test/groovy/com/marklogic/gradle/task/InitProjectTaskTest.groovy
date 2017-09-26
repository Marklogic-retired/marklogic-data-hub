package com.marklogic.gradle.task

import com.marklogic.hub.HubConfig
import org.gradle.testkit.runner.UnexpectedBuildFailure

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class InitProjectTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
    }

    def "init a hub project"() {

        when: "we begin"
            File pluginsDir = new File(testProjectDir.root, "plugins")
            File hubConfigDir = new File(testProjectDir.root, HubConfig.HUB_CONFIG_DIR)
            File userConfigDir = new File(testProjectDir.root, HubConfig.USER_CONFIG_DIR)
        then:
            pluginsDir.isDirectory() == false
            hubConfigDir.isDirectory() == false
            userConfigDir.isDirectory() == false

        when:
        def result
        try {
            result = runTask('hubInit')
        }
        catch (Exception e) {
            e.printStackTrace()
        }

        then:
            notThrown(UnexpectedBuildFailure)
            result.task(":hubInit").outcome == SUCCESS
            pluginsDir.isDirectory() == true
            hubConfigDir.isDirectory() == true
            userConfigDir.isDirectory() == true

    }
}
