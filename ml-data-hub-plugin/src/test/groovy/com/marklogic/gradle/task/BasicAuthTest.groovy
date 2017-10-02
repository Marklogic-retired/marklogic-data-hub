package com.marklogic.gradle.task

import org.gradle.testkit.runner.UnexpectedBuildFailure

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class BasicAuthTest extends BaseTest {

    def setupSpec() {
        createBuildFile()
        runTask("hubInit")
        createProperties()
    }

    void createProperties() {
        propertiesFile = new File(testProjectDir.root, 'gradle.properties')
        propertiesFile << """
            mlHost=localhost
            mlAppName=data-hub

            mlUsername=admin
            mlPassword=admin

            mlManageUsername=admin
            mlManagePassword=admin

            mlAdminUsername=admin
            mlAdminPassword=admin


            mlStagingAppserverName=data-hub-STAGING
            mlStagingPort=8010
            mlStagingDbName=data-hub-STAGING
            mlStagingForestsPerHost=4
            mlStagingAuth=basic


            mlFinalAppserverName=data-hub-FINAL
            mlFinalPort=8011
            mlFinalDbName=data-hub-FINAL
            mlFinalForestsPerHost=4
            mlFinalAuth=basic

            mlTraceAppserverName=data-hub-TRACING
            mlTracePort=8012
            mlTraceDbName=data-hub-TRACING
            mlTraceForestsPerHost=1
            mlTraceAuth=basic

            mlJobAppserverName=data-hub-JOBS
            mlJobPort=8013
            mlJobDbName=data-hub-JOBS
            mlJobForestsPerHost=1
            mlJobAuth=basic

            mlModulesDbName=data-hub-MODULES
            mlTriggersDbName=data-hub-TRIGGERS
            mlSchemasDbName=data-hub-SCHEMAS
        """
    }

    def "bootstrap a project with basic auth"() {
        when:
        def result = runTask('mlDeploy')
        print(result.output)

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":mlDeploy").outcome == SUCCESS
    }

}
