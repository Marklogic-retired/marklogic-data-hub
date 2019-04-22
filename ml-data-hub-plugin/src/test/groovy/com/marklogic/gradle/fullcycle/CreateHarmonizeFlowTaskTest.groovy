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

package com.marklogic.gradle.fullcycle

import com.marklogic.gradle.task.BaseTest
import com.marklogic.hub.HubConfig

import org.apache.commons.io.FileUtils
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class CreateHarmonizeFlowTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
        runTask("hubInit")
        runTask("mlDeploy")
		clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    def cleanupSpec() {
        runTask('mlUndeploy', '-Pconfirm=true')
    }

    def "createHarmonizeFlow with no entityName"() {
        when:
        def result = runFailTask('hubCreateHarmonizeFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('entityName property is required')
        result.task(":hubCreateHarmonizeFlow").outcome == FAILED
    }

    def "createHarmonizeFlow with no flowName"() {
        given:
        BaseTest.propertiesFile << """
            ext {
                entityName=my-new-entity
            }
        """

        when:
        def result = runFailTask('hubCreateHarmonizeFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('flowName property is required')
        result.task(":hubCreateHarmonizeFlow").outcome == FAILED
    }

    def "createHarmonizeFlow with valid name"() {
        given:
        BaseTest.propertiesFile << """
            ext {
                entityName=my-new-entity
                flowName=my-new-harmonize-flow
                useES=false
            }
        """

        when:
        def result = runTask('hubCreateHarmonizeFlow')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateHarmonizeFlow").outcome == SUCCESS

        File entityDir = Paths.get(BaseTest.testProjectDir.root.toString(), "plugins", "entities", "my-new-entity", "harmonize", "my-new-harmonize-flow").toFile()
        entityDir.isDirectory() == true
    }

    def "createHarmonizeFlow with bad mappingName"() {
        given:
        BaseTest.propertiesFile << """
            ext {
                entityName=my-new-entity
                flowName=my-new-harmonize-flow
                mappingName=missing-mapping
                useES=true
            }
        """

        when:
        def result = runFailTask('hubCreateHarmonizeFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('The requested entity: ')
        result.task(":hubCreateHarmonizeFlow").outcome == FAILED
    }

    def "createHarmonizeFlow with valid mappingName"() {
		given:
		def mappingDir = Paths.get(hubConfig().hubProject.projectDirString).resolve("mappings")
		def entitiesDir = Paths.get(hubConfig().hubProject.projectDirString).resolve("entities")
        def myMappingDir = mappingDir.resolve("my-new-mapping")

        myMappingDir.toFile().mkdirs()
        FileUtils.copyFile(new File("src/test/resources/my-new-mapping-1.mapping.json"), myMappingDir.resolve('my-new-mapping-1.mapping.json').toFile())
		runTask("hubDeployUserModules")
		entitiesDir.toFile().mkdirs();
		FileUtils.copyFile(new File("src/test/resources/employee.entity.json"), entitiesDir.resolve('Employee.entity.json').toFile())
		runTask("hubDeployUserModules")

		when:
		def result = runTask('hubCreateHarmonizeFlow', '-PentityName=Employee', '-PflowName=mapping-harmonize-flow', '-PmappingName=my-new-mapping-1', '-PuseES=true')

		then:
		notThrown(UnexpectedBuildFailure)
		result.task(":hubCreateHarmonizeFlow").outcome == SUCCESS
	}
}
