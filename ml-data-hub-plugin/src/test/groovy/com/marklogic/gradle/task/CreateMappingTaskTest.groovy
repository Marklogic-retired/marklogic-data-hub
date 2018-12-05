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

import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class CreateMappingTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def "create mapping with no name"() {
        when:
        def result = runFailTask('hubCreateMapping')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('mappingName property is required')
        result.task(":hubCreateMapping").outcome == FAILED
    }

    def "create mapping with valid name"() {
        given:
        propertiesFile << """
            ext {
                mappingName=my-new-mapping
            }
        """

        when:
        def result = runTask('hubCreateMapping')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateMapping").outcome == SUCCESS

        File mappingDir = Paths.get(testProjectDir.root.toString(), "plugins", "mappings", "my-new-mapping").toFile()
        mappingDir.isDirectory() == true
    }

}
