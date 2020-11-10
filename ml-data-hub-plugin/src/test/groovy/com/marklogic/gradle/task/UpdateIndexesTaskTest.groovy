/*
 * Copyright (c) 2020 MarkLogic Corporation
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


import org.gradle.testkit.runner.UnexpectedBuildFailure
import spock.lang.IgnoreIf

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class UpdateIndexesTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
        println(runTask("hubInit"))
    }

	def setup() {
		// Creating an Order Entity
		propertiesFile << """
            ext {
                entityName=my-unique-order-entity
            }
        """
		runTask('hubCreateEntity')
		File entityDir = Paths.get(testProjectDir.root.toString(), "entities").toFile()
		entityDir.isDirectory() == true

		// Copying Order.entity.json file to plugins/entities/my-unique-order-entity directory
		String entityStream = new File("src/test/resources/update-indexes/my-unique-order-entity.entity.json").getAbsolutePath()
		Files.copy(new File(entityStream).toPath(), entityDir.toPath().resolve("my-unique-order-entity.entity.json"), StandardCopyOption.REPLACE_EXISTING)

		runTask('hubDeployUserArtifacts')
        Thread.sleep(1000)
        runTask('hubSaveIndexes')
        Thread.sleep(1000)

		// Copying Job database Index info files to src/main/entity-config dir
		Path dir = hubConfig().getEntityDatabaseDir()
		if (!dir.toFile().exists()) {
			dir.toFile().mkdirs()
		}

		dir = hubConfig().getHubConfigDir()
		File dstFile = Paths.get(dir.toString(), "databases", "job-database.json").toFile()
		String entityConfigStream = new File("src/test/resources/update-indexes/job-database.json").getAbsolutePath();
		Files.copy(new File(entityConfigStream).toPath(), dstFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

        File xmlJobsDatabaseFieldFile = Paths.get(dir.toString(),"database-fields", "job-database.xml").toFile();
        String xmlJobsDBConfig = new File("src/test/resources/update-indexes/job-database.xml").getAbsolutePath();
        Files.copy(new File(xmlJobsDBConfig).toPath(), xmlJobsDatabaseFieldFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

        File xmlStagingDatabaseFieldFile = Paths.get(dir.toString(),"database-fields", "staging-database.xml").toFile();
        String xmlStagingDBConfig = new File("src/test/resources/update-indexes/staging-database.xml").getAbsolutePath();
        Files.copy(new File(xmlStagingDBConfig).toPath(), xmlStagingDatabaseFieldFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

        File xmlFinalDatabaseFieldFile = Paths.get(hubConfig().getUserConfigDir().toString(),"database-fields", "final-database.xml").toFile();
        String xmlFinalDBConfig = new File("src/test/resources/update-indexes/final-database.xml").getAbsolutePath();
        Files.copy(new File(xmlFinalDBConfig).toPath(), xmlFinalDatabaseFieldFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

	}

    @IgnoreIf({ System.getProperty('mlIsProvisionedEnvironment') })
	def "test to deploy indexes to STAGING/FINAL/JOBS Database"() {
		given:

		when:
		def result = runTask('mlUpdateIndexes')

		then:
		notThrown(UnexpectedBuildFailure)
		result.task(":mlUpdateIndexes").outcome == SUCCESS

        //Test to verify range-path-index for mlUpdateIndex
		assert (getStagingIndexValuesSize('//m:range-path-index') == 3)
		assert (getFinalIndexValuesSize('//m:range-path-index') == 3)

        //Test to verify xml DB index configs get updated per DHFPROD-3674
        assert (getStagingIndexValuesSize('//m:range-field-index') == 6)
        assert (getFinalIndexValuesSize('//m:range-field-index') == 6)
	}
}
