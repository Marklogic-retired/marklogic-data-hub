package com.marklogic.gradle.task

import com.marklogic.hub.Debugging
import com.marklogic.hub.Tracing
import org.apache.commons.io.FileUtils
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS


class InstalledTests extends BaseTest {
    def setupSpec() {
        runTask('hubInit')
        runTask('mlUndeploy')
        runTask('mlDeploy')
    }

    def cleanupSpec() {
        runTask('mlUndeploy')
    }

    def "enable debugging with hub installed"() {
        when:
        def result = runTask('hubEnableDebugging')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubEnableDebugging").outcome == SUCCESS
        Debugging d = new Debugging(stagingClient())
        d.isEnabled() == true
    }

    def "disable debugging with hub installed"() {
        when:
        def result = runTask('hubDisableDebugging')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubDisableDebugging").outcome == SUCCESS
        Debugging d = new Debugging(stagingClient())
        d.isEnabled() == false
    }

    def "enable tracing with hub installed"() {
        when:
        def result = runTask('hubEnableTracing')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubEnableTracing").outcome == SUCCESS
        Tracing t = new Tracing(stagingClient())
        t.isEnabled() == true
    }

    def "disable tracing with hub installed"() {
        when:
        def result = runTask('hubDisableTracing')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubDisableTracing").outcome == SUCCESS
        Tracing t = new Tracing(stagingClient())
        t.isEnabled() == false
    }

    def "test run flow works when hub is installed"() {
        setup: "copy the plugins"
        File tempPluginsDir = new File(testProjectDir.root, "plugins")
        URL pluginsDir = this.class.getClassLoader().getResource("plugins");
        FileUtils.copyDirectory(new File(pluginsDir.toURI()), tempPluginsDir)

        and: "deploy user plugins"
        runTask('mlLoadModules')

        and: "append properties for task name and flow name"
        propertiesFile << """
                ext {
                    entityName=my-entity
                    flowName=my-flow
                }
            """

        when: "hubRunFlow is Run"
        def result = runTask('hubRunFlow', '-i')

        then: "it should run w/o errors"
        notThrown(UnexpectedBuildFailure)
        result.output.contains('completed.')
        result.task(":hubRunFlow").outcome == SUCCESS

    }

    def "test run flow with invalid flow"() {
        setup: "copy the plugins"
        File tempPluginsDir = new File(testProjectDir.root, "plugins")
        URL pluginsDir = this.class.getClassLoader().getResource("plugins");
        FileUtils.copyDirectory(new File(pluginsDir.toURI()), tempPluginsDir)

        and: "deploy user plugins"
        runTask('mlLoadModules')

        and: "append properties for task name and flow name"
        propertiesFile << """
                ext {
                    entityName=my-entity
                    flowName=my-flow-not-found
                }
            """

        when: "hubRunFlow is Run"
        def result = runFailTask('hubRunFlow', '-i')

        then: "it should run with errors"
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('The requested flow was not found')
        result.task(":hubRunFlow").outcome == FAILED
    }
}
