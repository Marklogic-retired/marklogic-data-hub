package com.marklogic.gradle.task

import com.marklogic.hub.HubConfig
import org.apache.commons.io.FileUtils
import org.gradle.testkit.runner.UnexpectedBuildFailure

import java.nio.file.Path
import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class GenerateTDETemplateFromEntityTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    def "GenerateTDETEmplates"() {
        given:
        //DHF style nested entities (references in separate file)
        def entitiesDir = Paths.get(hubConfig().hubProject.projectDirString).resolve("entities")
        if (!entitiesDir.toFile().exists()) {
            entitiesDir.toFile().mkdirs()
        }

        FileUtils.copyFile(new File("src/test/resources/tde-template/Order.entity.json"), entitiesDir.resolve('Order.entity.json').toFile())
        FileUtils.copyFile(new File("src/test/resources/tde-template/Item.entity.json"), entitiesDir.resolve('Item.entity.json').toFile())
        FileUtils.copyFile(new File("src/test/resources/tde-template/Customer.entity.json"), entitiesDir.resolve('Customer.entity.json').toFile())

        FileUtils.copyFile(new File("src/test/resources/tde-template/Order1.entity.json"), entitiesDir.resolve('Order1.entity.json').toFile())
        FileUtils.copyFile(new File("src/test/resources/tde-template/e2eentity.entity.json"), entitiesDir.resolve('e2eentity.entity.json').toFile())

        runTask("hubDeployUserArtifacts")

        when:
        def result = runTask('hubGenerateTDETemplates', '-PentityNames=Order,Order1,e2eentity,nonexistentEntity')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubGenerateTDETemplates").outcome == SUCCESS

        Path tdePath = Paths.get(hubConfig().hubProject.userDatabaseDir.toString(), HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "schemas", "tde")
        tdePath.resolve("Order-1.0.0.tdex").toFile().exists() == true
        tdePath.resolve("Order1-1.0.0.tdex").toFile().exists() == true
        tdePath.resolve("e2eentity-0.0.1.tdex").toFile().exists() == true
        tdePath.resolve("nonexistentEntity-0.0.1.tdex").toFile().exists() == false

    }
}
