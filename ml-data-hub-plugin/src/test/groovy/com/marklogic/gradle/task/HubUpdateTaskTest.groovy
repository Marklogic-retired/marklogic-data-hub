/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.marklogic.gradle.task

import org.apache.commons.io.FileUtils
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class HubUpdateTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        // this will be relatively fast (idempotent) for already-installed hubs
        println(runTask('hubInstallModules', '-i').getOutput())
        println(runTask('mlLoadModules', '-i').getOutput())
    }
    
    //if 4.0 project is upgraded, remove the backed up directories
    def setup() {
        File hubConfigDir = hubConfig().hubProject.projectDir.resolve("src/main/hub-internal-config-" + hubConfig().getDHFVersion()).toFile()
        File mlConfigDir = hubConfig().hubProject.projectDir.resolve("src/main/ml-config-" + hubConfig().getDHFVersion()).toFile()
        if (hubConfigDir.exists() && mlConfigDir.exists()) {
            FileUtils.forceDelete(hubConfigDir)
            FileUtils.forceDelete(mlConfigDir)
        }
    }

    def "no updates needed"() {
        given:
            println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy', '-PuseES=false').getOutput())
        when:
            def result = runTask("hubUpdate")

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('No Legacy Flows to Update')
        result.task(":hubUpdate").outcome == SUCCESS
    }

    def "pre-main updates needed"() {
        given:
        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy', '-PuseES=false').getOutput())
        def entityDir = BaseTest.testProjectDir.root.toPath().resolve("plugins").resolve("entities").resolve("legacy-test")
        def inputDir = entityDir.resolve("input")
        def harmonizeDir = entityDir.resolve("harmonize")
        inputDir.toFile().mkdirs()
        harmonizeDir.toFile().mkdirs()
        FileUtils.copyDirectory(new File("src/test/resources/legacy-input-flow"), inputDir.resolve("legacy-input-flow").toFile())
        FileUtils.copyDirectory(new File("src/test/resources/legacy-harmonize-flow"), harmonizeDir.resolve("legacy-harmonize-flow").toFile())
        FileUtils.forceDelete(new File(BaseTest.testProjectDir.root.toString(),"gradle-GENERATED.properties"))
        when:
        def result = runTask("hubUpdate")

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Legacy Flows Updated:\n\tlegacy-test => legacy-input-flow\n\tlegacy-test => legacy-harmonize-flow')
        result.task(":hubUpdate").outcome == SUCCESS
    }

    def "2x (pre-3x) updates needed"() {
        given:
        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy', '-PuseES=false').getOutput())
        def entityDir = BaseTest.testProjectDir.root.toPath().resolve("plugins").resolve("entities").resolve("2x-test")
        def inputDir = entityDir.resolve("input")
        def harmonizeDir = entityDir.resolve("harmonize")
        inputDir.toFile().mkdirs()
        harmonizeDir.toFile().mkdirs()
        FileUtils.copyDirectory(new File("src/test/resources/2x-input-flow"), inputDir.resolve("2x-input-flow").toFile())
        FileUtils.copyDirectory(new File("src/test/resources/2x-harmonize-flow"), harmonizeDir.resolve("2x-harmonize-flow").toFile())
        FileUtils.forceDelete(new File(BaseTest.testProjectDir.root.toString(),"gradle-GENERATED.properties"))
        when:
        def result = runTask("hubUpdate")

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Legacy Flows Updated:\n\t2x-test => 2x-input-flow\n\t2x-test => 2x-harmonize-flow')
        result.task(":hubUpdate").outcome == SUCCESS
    }
}
