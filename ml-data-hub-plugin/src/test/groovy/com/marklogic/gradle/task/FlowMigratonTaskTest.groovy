package com.marklogic.gradle.task

import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

//This is a smoke test to ensure the tasks run fine

class FlowMigratonTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        //hubInit doesn't create mappings dir any more.
        if(! new File(testProjectDir.getRoot(),'mappings').exists()){
            testProjectDir.newFolder("mappings")
        }
    }

    def "run hubMigrateFlows without confirm"() {
        when:
        def result
        result = runFailTask("hubMigrateFlows")

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains("To execute this task, set the 'confirm' property to 'true'; e.g. '-Pconfirm=true'")
    }

    def "run hubMigrateFlows with confirm"() {
        when:
        def result
        result = runTask("hubMigrateFlows", '-Pconfirm=true')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubMigrateFlows").outcome == SUCCESS
    }

    def "run hubMigrateFlows should not throw NPE"() {
        when:
        def result
        runTask("hubMigrateFlows", '-Pconfirm=true')
        result = runTask("hubMigrateFlows", '-Pconfirm=true')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubMigrateFlows").outcome == SUCCESS
    }
}
