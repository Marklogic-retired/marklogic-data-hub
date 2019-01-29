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
        def pluginDir = Paths.get(hubConfig().hubProject.projectDirString).resolve("plugins")

        def entitiesDir1 = pluginDir.resolve("entities").resolve("Order")
        def entitiesDir2 = pluginDir.resolve("entities").resolve("Item")
        def entitiesDir3 = pluginDir.resolve("entities").resolve("Customer")

        entitiesDir1.toFile().mkdirs()
        entitiesDir2.toFile().mkdirs()
        entitiesDir3.toFile().mkdirs()

        FileUtils.copyFile(new File("src/test/resources/tde-template/Order.entity.json"), entitiesDir1.resolve('Order.entity.json').toFile())
        FileUtils.copyFile(new File("src/test/resources/tde-template/Item.entity.json"), entitiesDir2.resolve('Item.entity.json').toFile())
        FileUtils.copyFile(new File("src/test/resources/tde-template/Customer.entity.json"), entitiesDir3.resolve('Customer.entity.json').toFile())

        runTask("hubDeployUserArtifacts")

        when:
        def result = runTask('hubGenerateTDETemplates')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubGenerateTDETemplates").outcome == SUCCESS

        Path tdePath = Paths.get(testProjectDir.root.toString(), "src", "main", "ml-schemas", "tde")
        tdePath.resolve("Order-1.0.0.tdex").toFile().exists() == true
        tdePath.resolve("Item-1.0.0.tdex").toFile().exists() == true
        tdePath.resolve("Customer-1.0.0.tdex").toFile().exists() == true

    }
}
