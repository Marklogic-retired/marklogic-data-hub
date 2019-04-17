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

class CreateStepDefinitionTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    def "create step with no name"() {
        when:
        def result = runFailTask('hubCreateStepDefinition')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('stepDefName property is required')
        result.task(":hubCreateStepDefinition").outcome == FAILED
    }

    def "create step with valid name only"() {
        given:
        propertiesFile << """
            ext {
                stepDefName=my-test-step
            }
        """

        when:
        def result = runTask('hubCreateStepDefinition')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateStepDefinition").outcome == SUCCESS

        // It should default to "CUSTOM" type when none specified
        File stepDir = Paths.get(testProjectDir.root.toString(), "step-definitions", "custom", "my-test-step").toFile()
        println stepDir.toString()
        stepDir.isDirectory()
    }

    def "create step with valid name and type"() {
        given:
        propertiesFile << """
            ext {
                stepDefName=my-new-step
                stepDefType=mapping
            }
        """

        when:
        def result = runTask('hubCreateStepDefinition')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateStepDefinition").outcome == SUCCESS

        File stepDir = Paths.get(testProjectDir.root.toString(), "step-definitions", "mapping", "my-new-step").toFile()
        stepDir.isDirectory()
    }
}
