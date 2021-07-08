package com.marklogic.gradle.task

import com.marklogic.hub.HubConfig
import org.apache.commons.io.FileUtils
import org.gradle.testkit.runner.UnexpectedBuildFailure

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class ClearUserSchemasTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def setup(){
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME)
        FileUtils.copyFile(new File("src/test/resources/tde-template/Customer.entity.json"), hubConfig().hubEntitiesDir.resolve('Customer.entity.json').toFile())
        runTask("hubDeployUserArtifacts")
        getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/entity-services/models") == 1
        getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/entity-services/models") == 1
    }

    def "clear schemas db"() {

        when:
        def result = runTask('hubClearUserSchemas', '-Pconfirm=true')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubClearUserSchemas").outcome == SUCCESS
        getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/entity-services/models") == 0
        getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/entity-services/models") == 0
    }
}
