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

import com.marklogic.hub.HubConfig
import com.marklogic.hub.HubProject
import com.marklogic.hub.util.FileUtil

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption

import static org.gradle.testkit.runner.TaskOutcome.FAILED
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
                entityName=Order
            }
        """
		runTask('hubCreateEntity')
		File entityDir = Paths.get(testProjectDir.root.toString(), "plugins", "entities", "Order").toFile()
		entityDir.isDirectory() == true
		
		// Copying Order.entity.json file to plugins/entities/Order directory
		String entityStream = new File("src/test/resources/update-indexes/Order.entity.json").getAbsolutePath()
		Files.copy(new File(entityStream).toPath(), entityDir.toPath(), StandardCopyOption.REPLACE_EXISTING)
		
		// Loading modules to databases
		runTask('mlLoadModules')
		
		// Copying Staging and Final database Index info files to src/main/entity-config dir
		Path dir = hubConfig().getEntityDatabaseDir()
		if (!dir.toFile().exists()) {
			dir.toFile().mkdirs()
		}
		
		File dstFile = Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_DATABASE_FILE).toFile()
		String entityConfigStream = new File("src/test/resources/update-indexes/staging-database.json").getAbsolutePath()
		Files.copy(new File(entityConfigStream).toPath(), dstFile.toPath(), StandardCopyOption.REPLACE_EXISTING)
		
		dstFile = Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_DATABASE_FILE).toFile();
		entityConfigStream = new File("src/test/resources/update-indexes/final-database.json").getAbsolutePath()
		Files.copy(new File(entityConfigStream).toPath(), dstFile.toPath(), StandardCopyOption.REPLACE_EXISTING)
		
		dir = _hubConfig.getHubConfigDir()
		dstFile = Paths.get(dir.toString(), "databases", "job-database.json").toFile()
		entityConfigStream = new File("src/test/resources/update-indexes/job-database.json").getAbsolutePath();
		Files.copy(new File(entityConfigStream).toPath(), dstFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
	}
	
	def "test to deploy indexes to STAGING/FINAL/JOBS Database"() {
		given:
		int stagingIndexCount = getStagingRangePathIndexSize()
		int finalIndexCount = getFinalRangePathIndexSize()
		int jobIndexCount = getJobsRangePathIndexSize()
		
		when:
		def result = runTask('mlUpdateIndexes')

		then:
		notThrown(UnexpectedBuildFailure)
		result.task(":mlUpdateIndexes").outcome == SUCCESS
		
		assert (getStagingRangePathIndexSize() == stagingIndexCount+1)
		assert (getFinalRangePathIndexSize() == finalIndexCount+1)
		assert (getJobsRangePathIndexSize() == jobIndexCount+1)
	}
}
