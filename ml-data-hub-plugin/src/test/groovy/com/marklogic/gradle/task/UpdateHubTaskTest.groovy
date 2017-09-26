package com.marklogic.gradle.task

import org.apache.commons.io.FileUtils
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class UpdateHubTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def "no updates needed"() {
        given:
            println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy').getOutput())
        when:
            def result = runTask("hubUpdate")

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('No Legacy Flows to Update')
        result.task(":hubUpdate").outcome == SUCCESS
    }

    def "updates needed"() {
        given:
        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy').getOutput())
        def entityDir = Paths.get(hubConfig().projectDir).resolve("plugins").resolve("entities").resolve("legacy-test")
        def inputDir = entityDir.resolve("input")
        def harmonizeDir = entityDir.resolve("harmonize")
        inputDir.toFile().mkdirs()
        harmonizeDir.toFile().mkdirs()
        FileUtils.copyDirectory(new File("src/test/resources/legacy-input-flow"), inputDir.resolve("legacy-input-flow").toFile())
        FileUtils.copyDirectory(new File("src/test/resources/legacy-harmonize-flow"), harmonizeDir.resolve("legacy-harmonize-flow").toFile())
        when:
        def result = runTask("hubUpdate")

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Legacy Flows Updated:\n\tlegacy-test => legacy-input-flow\n\tlegacy-test => legacy-harmonize-flow')
        result.task(":hubUpdate").outcome == SUCCESS
    }
}
