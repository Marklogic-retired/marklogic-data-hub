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


import groovy.json.JsonSlurper
import org.gradle.testkit.runner.UnexpectedBuildFailure
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import java.nio.file.Paths

import static org.gradle.testkit.runner.TaskOutcome.FAILED
import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class CreateStepDefinitionTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
    }

    def "create step with no name"() {
        when:
        def result = runFailTask('hubCreateStepDefinition')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('stepDefName must be defined via -PstepDefName=YourStepDefName')
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
        def jsonSlurper = new JsonSlurper()
        def data = jsonSlurper.parse(Paths.get(testProjectDir.root.toString(), "step-definitions", "custom", "my-test-step", "my-test-step.step.json").toFile());
        data.options.permissions == "data-hub-common,read,data-hub-common,update";
    }

    def "create step with valid name and type"() {
        given:
        propertiesFile << """
            ext {
                stepDefName=my-new-step
                stepDefType=ingestion
            }
        """

        when:
        def result = runTask('hubCreateStepDefinition')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubCreateStepDefinition").outcome == SUCCESS

        File stepDir = Paths.get(testProjectDir.root.toString(), "step-definitions", "ingestion", "my-new-step").toFile()
        stepDir.isDirectory()
        def jsonSlurper = new JsonSlurper()
        def data = jsonSlurper.parse(Paths.get(testProjectDir.root.toString(), "step-definitions", "ingestion", "my-new-step", "my-new-step.step.json").toFile());
        data.options.permissions == "data-hub-common,read,data-hub-common,update";
    }

    /**
     * Per DHFPROD-5193 and as of 5.3.0, only "ingestion" and "custom" are supported for custom step definitions.
     * @return
     */
    def "create step with invalid type"() {
        given:
        propertiesFile << """
            ext {
                stepDefName=my-mastering-step
                stepDefType=mastering
            }
        """

        when:
        def result = runFailTask('hubCreateStepDefinition')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains("stepDefType must have a value of either 'ingestion' or 'custom'")
        result.task(":hubCreateStepDefinition").outcome == FAILED
    }

    def "create step def with invalid name"() {
        given:
        propertiesFile << """
            ext {
                stepDefName=my^StepDef
                stepDefType=ingestion
            }
        """

        when:
        def failedResult = runFailTask('hubCreateStepDefinition')

        then:
        notThrown(UnexpectedBuildSuccess)
        failedResult.output.contains("Invalid name: 'my^StepDef';")
        failedResult.task(":hubCreateStepDefinition").outcome == FAILED
        !Paths.get(testProjectDir.root.toString(), "step-definitions", "my^StepDef.flow.json").toFile().exists()
    }

    def "duplicate step definition exists"() {
        given:
        propertiesFile << """
            ext {
                stepDefName=my-step
                stepDefType=custom
                format=sjs
            }
        """

        when:
        runTask('hubCreateStepDefinition')
        def result = runFailTask('hubCreateStepDefinition')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains("A step definition already exists with the name 'my-step' and type 'custom'")
        result.task(":hubCreateStepDefinition").outcome == FAILED
    }

    def "create step with invalid format"() {
        given:
        propertiesFile << """
            ext {
                stepDefName=my-invalid-step
                stepDefType=custom
                format=java
            }
        """

        when:
        def result = runFailTask('hubCreateStepDefinition')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains("format must have a value of either 'sjs' or 'xqy'")
        result.task(":hubCreateStepDefinition").outcome == FAILED
    }
}
