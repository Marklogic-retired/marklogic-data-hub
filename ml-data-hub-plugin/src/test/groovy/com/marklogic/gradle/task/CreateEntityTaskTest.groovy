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

import com.marklogic.hub.HubConfig
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class CreateEntityTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    def "create entity with no name"() {
        when:
        def result = runFailTask('hubCreateEntity')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('entityName property is required')
        result.task(":hubCreateEntity").outcome == FAILED
    }

    def "create entity with valid name"() {
        given:
        propertiesFile << """
            ext {
                entityName=my-new-entity
            }
        """
        getStagingDocCount("http://marklogic.com/entity-services/models") == 0
        def modCount = getModulesDocCount();
        when:
        def result = runTask('hubCreateEntity', 'hubDeployUserArtifacts')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateEntity").outcome == SUCCESS
        result.task(":hubDeployUserArtifacts").outcome == SUCCESS

        File entityFile = Paths.get(testProjectDir.root.toString(), "plugins", "entities", "my-new-entity", "my-new-entity.entity.json").toFile()
        entityFile.isFile() == true
        String entityActual = entityFile.getText('UTF-8').replaceAll("\\s+","")
        String entityExpected = new File("src/test/resources/my-new-entity.entity.json").getText('UTF-8').replaceAll("\\s+","")
        assert(entityActual == entityExpected)

        File entityDir = Paths.get(testProjectDir.root.toString(), "plugins", "entities", "my-new-entity").toFile()
        entityDir.isDirectory() == true
        getStagingDocCount("http://marklogic.com/entity-services/models") == 1
        getModulesDocCount() == modCount
    }

}
