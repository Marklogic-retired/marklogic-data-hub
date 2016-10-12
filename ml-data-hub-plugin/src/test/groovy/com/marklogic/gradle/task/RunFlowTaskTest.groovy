package com.marklogic.gradle.task

import org.apache.commons.io.FileUtils
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

public class RunFlowTaskTest extends BaseTest {

    def "test run flow with no entity"() {
        when:
            def result = runFailTask('hubRunFlow')

        then:
            notThrown(UnexpectedBuildSuccess)
            result.output.contains('entityName property is required')
            result.task(":hubRunFlow").outcome == FAILED
    }

    def "test run flow with no flow"() {
        given:
            propertiesFile << """
            ext {
                entityName=my-entity
            }
        """

        when:
            def result = runFailTask('hubRunFlow')

        then:
            notThrown(UnexpectedBuildSuccess)
            result.output.contains('flowName property is required')
            result.task(":hubRunFlow").outcome == FAILED
    }

    def "test run flow when hub not installed"() {
        given:
            propertiesFile << """
                ext {
                    entityName=my-entity
                    flowName=my-flow
                }
            """

        when:
            def result = runFailTask('hubRunFlow')

        then:
            notThrown(UnexpectedBuildSuccess)
            result.output.contains('Data Hub is not installed')
            result.task(":hubRunFlow").outcome == FAILED
    }

    def "test run flow works when hub is installed"() {
        setup: "init the project"
            runTask('hubInit')

        and: 'deploy to marklogic'
            runTask('mlDeploy')

        and: "copy the plugins"
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

        cleanup: "uninstall the hub"
            runTask('mlUndeploy')
    }

    def "test run flow with invalid flow"() {
        setup: "init the project"
            runTask('hubInit')

        and: 'deploy to marklogic'
            runTask('mlDeploy')

        and: "copy the plugins"
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

        cleanup: "uninstall the hub"
            runTask('mlUndeploy')
    }
}
