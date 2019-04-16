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

import com.fasterxml.jackson.databind.JsonNode
import com.marklogic.hub.HubConfig
import org.gradle.testkit.runner.UnexpectedBuildFailure

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class SaveIndexesTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
        runTask("hubInit")
    }

    def setup() {
        // Creating a test Entity one
        propertiesFile << """
            ext {
                entityName=my-unique-save-index-entity-1
            }
        """
        runTask('hubCreateEntity')
        File entityDir = Paths.get(testProjectDir.root.toString(), "entities").toFile()
        entityDir.isDirectory() == true

        // Copying my-unique-save-index-entity-1.entity.json file to plugins/entities/my-unique-save-index-entity-1 directory
        String entityCopy = new File("src/test/resources/update-indexes/my-unique-save-index-entity-1.entity.json").getAbsolutePath()
        String entityDirCopy = new File(entityDir.toPath().toString()).getAbsolutePath() + "/my-unique-save-index-entity-1.entity.json"
        Files.copy(new File(entityCopy).toPath(), new File(entityDirCopy).toPath(), StandardCopyOption.REPLACE_EXISTING)

        // Creating a test Entity two
        propertiesFile << """
            ext {
                entityName=my-unique-save-index-entity-2
            }
        """
        runTask('hubCreateEntity')
        entityDir = Paths.get(testProjectDir.root.toString(), "entities").toFile()
        entityDir.isDirectory() == true

        // Copying my-unique-save-index-entity-2.entity.json file to plugins/entities/my-unique-save-index-entity-2 directory
        entityCopy = new File("src/test/resources/update-indexes/my-unique-save-index-entity-2.entity.json").getAbsolutePath()
        entityDirCopy = new File(entityDir.toPath().toString()).getAbsolutePath() + "/my-unique-save-index-entity-2.entity.json"
        Files.copy(new File(entityCopy).toPath(), new File(entityDirCopy).toPath(), StandardCopyOption.REPLACE_EXISTING)
    }

    def "test to save indexes to staging-database.json and final-database.json files"() {
        given:
        Path dir = hubConfig().getEntityDatabaseDir()
        File stagingFile = Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_DATABASE_FILE).toFile();
        File finalFile = Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_DATABASE_FILE).toFile();

        stagingFile.exists() == false
        finalFile.exists() == false

        when:
        def result = runTask('hubSaveIndexes')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubSaveIndexes").outcome == SUCCESS

        stagingFile.exists() == true
        finalFile.exists() == true

        JsonNode stagingDatabaseIndexObj = getJsonResource(stagingFile.getAbsolutePath())
        int savedStagingIndexes = stagingDatabaseIndexObj.get("range-path-index").size()

        JsonNode finalDatabaseIndexObj = getJsonResource(finalFile.getAbsolutePath())
        int savedFinalIndexes = finalDatabaseIndexObj.get("range-path-index").size()

        assert (savedStagingIndexes == 2)
        assert (savedFinalIndexes == 2)
    }
}
