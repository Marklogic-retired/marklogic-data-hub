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

import org.apache.commons.io.FileUtils
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class CreateHarmonizeFlowTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
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
        propertiesFile << """
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
        propertiesFile << """
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

        File entityDir = Paths.get(testProjectDir.root.toString(), "plugins", "entities", "my-new-entity", "harmonize", "my-new-harmonize-flow").toFile()
        entityDir.isDirectory() == true
    }

    def "createHarmonizeFlow with bad mappingName"() {
        given:
        propertiesFile << """
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
        result.output.contains('The requested mapping ')
        result.task(":hubCreateHarmonizeFlow").outcome == FAILED
    }

    def "createHarmonizeFlow with valid mappingName"() {
        given:
        def pluginDir = Paths.get(hubConfig().projectDir).resolve("plugins")
        def mappingDir = pluginDir.resolve("mappings")
        def newMappingDir = mappingDir.resolve("my-new-mapping")
        mappingDir.toFile().mkdirs()
        newMappingDir.toFile().mkdirs()
        FileUtils.copyFile(new File("src/test/resources/my-new-mapping-1.mapping.json"), newMappingDir.resolve('my-new-mapping-1.mapping.json').toFile())
        propertiesFile << """
            ext {
                entityName=my-new-entity
                flowName=my-new-harmonize-flow
                mappingName=my-new-mapping
                useES=false
            }
        """
        runTask("mlLoadModules")

        when:
        def result = runTask('hubCreateHarmonizeFlow')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateHarmonizeFlow").outcome == SUCCESS

        File entityDir = Paths.get(testProjectDir.root.toString(), "plugins", "entities", "my-new-entity", "harmonize", "my-new-harmonize-flow").toFile()
        entityDir.isDirectory() == true
    }
}
