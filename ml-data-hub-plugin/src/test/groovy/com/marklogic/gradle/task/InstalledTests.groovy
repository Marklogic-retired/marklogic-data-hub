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

import com.marklogic.client.io.DOMHandle
import com.marklogic.client.io.DocumentMetadataHandle
import com.marklogic.hub.HubConfig
import org.apache.commons.io.FileUtils
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
        println(runTask('hubInstallModules', '-i').getOutput())
        println(runTask('mlLoadModules', '-i').getOutput())
		clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
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
        Debugging d = Debugging.create(hubConfig().newStagingClient())
        d.isEnabled() == true
    }

    def "disable debugging with hub installed"() {
        when:
        def result = runTask('hubDisableDebugging')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubDisableDebugging").outcome == SUCCESS
        Debugging d = Debugging.create(hubConfig().newStagingClient())
        d.isEnabled() == false
    }

    def "enable tracing with hub installed"() {
        when:
        def result = runTask('hubEnableTracing')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubEnableTracing").outcome == SUCCESS
        Tracing t = Tracing.create(hubConfig().newStagingClient())
        t.isEnabled() == true
    }

    def "disable tracing with hub installed"() {
        when:
        def result = runTask('hubDisableTracing')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubDisableTracing").outcome == SUCCESS
        Tracing t = Tracing.create(hubConfig().newStagingClient())
        t.isEnabled() == false
    }

    def "test run flow with invalid flow"() {
        when: "hubRunFlow is Run"
        def result = runFailTask('hubRunFlow', '-PentityName=my-new-entity', '-PflowName=my-flow-not-found', '-i')

        then: "it should run with errors"
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('The requested flow was not found')
        result.task(":hubRunFlow").outcome == FAILED
    }

    def "runHarmonizeFlow with default src and dest"() {
        given:
        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy', '-PuseES=false').getOutput())
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
        String result;
        installModule("/entities/my-new-entity/harmonize/my-new-harmonize-flow/content/content.xqy", "run-flow-test/content.xqy")

        when:
        result = runTask('hubRunFlow', '-Pdhf.key=value', '-PshowOptions=true','-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-i').getOutput()
        println(result)

        then:
        notThrown(UnexpectedBuildFailure)
        getStagingDocCount() == 2
        getFinalDocCount() == 2
        assert(result.contains("key = value"))
        assert(! result.contains("dhf.key = value"))
        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized1.xml"), hubConfig().newFinalClient().newDocumentManager().read("/employee1.xml").next().getContent(new DOMHandle()).get())
        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized2.xml"), hubConfig().newFinalClient().newDocumentManager().read("/employee2.xml").next().getContent(new DOMHandle()).get())
    }

    def "runHarmonizeFlow with swapped src and dest"() {
        given:
        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy', '-PuseES=false').getOutput())
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

        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized1.xml"), hubConfig().newStagingClient().newDocumentManager().read("/employee1.xml").next().getContent(new DOMHandle()).get())
        assertXMLEqual(getXmlFromResource("run-flow-test/harmonized2.xml"), hubConfig().newStagingClient().newDocumentManager().read("/employee2.xml").next().getContent(new DOMHandle()).get())
    }

    def "install Legacy Modules should fail"() {
        given:
        def entityDir = BaseTest.testProjectDir.root.toPath().resolve("plugins").resolve("entities").resolve("legacy-test")
        def inputDir = entityDir.resolve("input")
        inputDir.toFile().mkdirs()
        FileUtils.copyDirectory(new File("src/test/resources/legacy-input-flow"), inputDir.resolve("legacy-input-flow").toFile())

        when:
        def result = runFailTask('hubDeployUserModules', '-i')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.getOutput().contains('The following Flows are legacy flows:')
        result.getOutput().contains('legacy-test => legacy-input-flow')
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

        println(runTask('hubCreateHarmonizeFlow', '-PentityName=my-new-entity', '-PflowName=my-new-harmonize-flow', '-PdataFormat=xml', '-PpluginFormat=xqy', '-PuseES=false').getOutput())
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
