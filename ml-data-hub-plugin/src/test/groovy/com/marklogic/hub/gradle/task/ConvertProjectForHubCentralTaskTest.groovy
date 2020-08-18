package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.BaseTest
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

//This is a smoke test to ensure the tasks run fine

class ConvertProjectForHubCentralTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        //hubInit doesn't create mappings dir any more.
        if(! new File(BaseTest.testProjectDir.getRoot(),'mappings').exists()){
            BaseTest.testProjectDir.newFolder("mappings")
        }
    }

    def "run without confirm"() {
        when:
        def result
        result = runFailTask("hubConvertForHubCentral")

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains("To execute this task, set the 'confirm' property to 'true'; e.g. '-Pconfirm=true'")
    }

    def "run with confirm"() {
        when:
        def result
        result = runTask("hubConvertForHubCentral", '-Pconfirm=true')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubConvertForHubCentral").outcome == SUCCESS
    }

    def "run should not throw NPE"() {
        when:
        def result
        runTask("hubConvertForHubCentral", '-Pconfirm=true')
        result = runTask("hubConvertForHubCentral", '-Pconfirm=true')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubConvertForHubCentral").outcome == SUCCESS
    }
}
