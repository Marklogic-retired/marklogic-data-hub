/*
 * Copyright 2012-2018 MarkLogic Corporation
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

import com.marklogic.client.io.DOMHandle
import com.marklogic.client.io.DocumentMetadataHandle
import com.marklogic.hub.HubConfig
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess
import com.marklogic.hub.Tracing;
import com.marklogic.hub.Debugging;

import java.nio.file.Paths

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual
import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class InstalledTests extends BaseTest {
    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        // this will be relatively fast (idempotent) for already-installed hubs
        println(runTask('mlDeploy', '-i').getOutput())
    }

    def cleanupSpec() {
        //runTask('mlUndeploy', '-Pconfirm=true')
    }

    def "enable debugging with hub installed"() {
        when:
        def result = runTask('hubEnableDebugging')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubEnableDebugging").outcome == SUCCESS
        Debugging d = Debugging.create(hubConfig().newStagingManageClient())
        d.isEnabled() == true
    }

    def "disable debugging with hub installed"() {
        when:
        def result = runTask('hubDisableDebugging')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubDisableDebugging").outcome == SUCCESS
        Debugging d = Debugging.create(hubConfig().newStagingManageClient())
        d.isEnabled() == false
    }

    def "enable tracing with hub installed"() {
        when:
        def result = runTask('hubEnableTracing')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubEnableTracing").outcome == SUCCESS
        Tracing t = Tracing.create(hubConfig().newStagingManageClient())
        t.isEnabled() == true
    }

    def "disable tracing with hub installed"() {
        when:
        def result = runTask('hubDisableTracing')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubDisableTracing").outcome == SUCCESS
        Tracing t = Tracing.create(hubConfig().newStagingManageClient())
        t.isEnabled() == false
    }

    def "test run flow with invalid flow"() {
        setup: "append properties for task name and flow name"
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

    def "runHarmonizeFlow with default src and dest"() {
        given:
        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy').getOutput())
        println(runTask('mlReLoadModules'))

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME)

        assert (getStagingDocCount() == 0)
        assert (getFinalDocCount() == 0)

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("my-new-entity");
        installStagingDoc("/employee1.xml", meta, new File("src/test/resources/run-flow-test/employee1.xml").text)
        installStagingDoc("/employee2.xml", meta, new File("src/test/resources/run-flow-test/employee2.xml").text)
        assert (getStagingDocCount() == 2)
        assert (getFinalDocCount() == 0)

        installModule("/entities/my-new-entity/harmonize/my-new-harmonize-flow/content/content.xqy", "run-flow-test/content.xqy")

        when:
        println(runTask('hubRunFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-i').getOutput())

        then:
        notThrown(UnexpectedBuildFailure)
        getStagingDocCount() == 2
        getFinalDocCount() == 2
        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized1.xml"), hubConfig().newFinalManageClient().newDocumentManager().read("/employee1.xml").next().getContent(new DOMHandle()).get())
        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized2.xml"), hubConfig().newFinalManageClient().newDocumentManager().read("/employee2.xml").next().getContent(new DOMHandle()).get())
    }

    def "runHarmonizeFlow with swapped src and dest"() {
        given:
        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy').getOutput())
        println(runTask('mlReLoadModules'))

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME)
        assert (getStagingDocCount() == 0)
        assert (getFinalDocCount() == 0)

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("my-new-entity");
        installFinalDoc("/employee1.xml", meta, new File("src/test/resources/run-flow-test/employee1.xml").text)
        installFinalDoc("/employee2.xml", meta, new File("src/test/resources/run-flow-test/employee2.xml").text)

        assert (getStagingDocCount() == 0)
        assert (getFinalDocCount() == 2)
        installModule("/entities/my-new-entity/harmonize/my-new-harmonize-flow/content/content.xqy", "run-flow-test/content.xqy")

        when:
        println(runTask(
            'hubRunFlow',
            '-PentityName=my-new-entity',
            '-PflowName=my-new-harmonize-flow',
            '-PsourceDB=data-hub-FINAL',
            '-PdestDB=data-hub-STAGING',
            '-i'
        ).getOutput())

        then:
        notThrown(UnexpectedBuildFailure)
        getStagingDocCount() == 2
        getFinalDocCount() == 2

        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized1.xml"), hubConfig().newStagingManageClient().newDocumentManager().read("/employee1.xml").next().getContent(new DOMHandle()).get())
        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized2.xml"), hubConfig().newStagingManageClient().newDocumentManager().read("/employee2.xml").next().getContent(new DOMHandle()).get())
    }

    def "install Legacy Modules should fail"() {
        given:
        def entityDir = Paths.get(hubConfig().projectDir).resolve("plugins").resolve("entities").resolve("legacy-test")
        def inputDir = entityDir.resolve("input")
        inputDir.toFile().mkdirs()
        org.gradle.internal.impldep.org.apache.commons.io.FileUtils.copyDirectory(new File("src/test/resources/legacy-input-flow"), inputDir.resolve("legacy-input-flow").toFile())

        when:
        def result = runFailTask('mlLoadModules')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('The following Flows are legacy flows:')
        result.output.contains('legacy-test => legacy-input-flow')
        result.task(":mlLoadModules").outcome == FAILED
    }

    def "createHarmonizeFlow with useES flag"() {
        given:
        propertiesFile << """
            ext {
                entityName=Employee
                flowName=my-new-harmonize-flow
                useES=true
            }
        """

        when:
        runTask('hubUpdate')
        runTask('hubCreateEntity')
        copyResourceToFile("employee.entity.json", Paths.get(testProjectDir.root.toString(), "plugins", "entities", "Employee", "Employee.entity.json").toFile())
        runTask('mlLoadModules')
        def result = runTask('hubCreateHarmonizeFlow')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateHarmonizeFlow").outcome == SUCCESS

        File entityDir = Paths.get(testProjectDir.root.toString(), "plugins", "entities", "Employee", "harmonize", "my-new-harmonize-flow").toFile()
        entityDir.isDirectory() == true
        File contentPlugin = Paths.get(testProjectDir.root.toString(), "plugins", "entities", "Employee", "harmonize", "my-new-harmonize-flow", "content.sjs").toFile()
        contentPlugin.text.contains("extractInstanceEmployee")
    }

    def "runHarmonizeFlow with bad sourceDB"() {
        given:

        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy').getOutput())
        println(runTask('mlReLoadModules'))

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME)
        assert (getStagingDocCount() == 0)
        assert (getFinalDocCount() == 0)

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("my-new-entity");
        installStagingDoc("/employee1.xml", meta, new File("src/test/resources/run-flow-test/employee1.xml").text)
        installStagingDoc("/employee2.xml", meta, new File("src/test/resources/run-flow-test/employee2.xml").text)

        assert (getStagingDocCount() == 2)
        assert (getFinalDocCount() == 0)
        installModule("/entities/my-new-entity/harmonize/my-new-harmonize-flow/content/content.xqy", "run-flow-test/content.xqy")


        when:
        propertiesFile << """
            ext {
                entityName=my-new-entity
                flowName=my-new-harmonize-flow
                sourceDB=12345678
            }
        """
        def result = runTask('hubRunFlow', '-i')

        then:
        notThrown(UnexpectedBuildFailure)
        result.getOutput().contains('No such database 12345678')
        result.task(":hubRunFlow").outcome == SUCCESS
    }
}
