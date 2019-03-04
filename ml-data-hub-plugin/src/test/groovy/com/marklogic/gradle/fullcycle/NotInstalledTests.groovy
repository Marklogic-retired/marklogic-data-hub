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
import org.gradle.testkit.runner.UnexpectedBuildSuccess

import static org.gradle.testkit.runner.TaskOutcome.FAILED

class NotInstalledTests extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        runTask("hubDeploySecurity")
        //runTask('mlUndeploy',  '-Pconfirm=true')
    }

    def cleanupSpec() {
        //runTask('mlDeploy')
    }

    def "enable debugging hub not installed"() {
        when:
        def result = runFailTask('hubEnableDebugging')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Data Hub is not installed')
        result.task(":hubEnableDebugging").outcome == FAILED
    }

    def "disable debugging hub not installed"() {
        when:
        def result = runFailTask('hubDisableDebugging')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Data Hub is not installed')
        result.task(":hubDisableDebugging").outcome == FAILED
    }

    def "test run flow with no entity"() {
        when:
        def result = runFailTask('hubRunLegacyFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('entityName property is required')
        result.task(":hubRunLegacyFlow").outcome == FAILED
    }

    def "test run flow with no flow"() {
        given:
        BaseTest.propertiesFile << """
            ext {
                entityName=my-entity
            }
        """

        when:
        def result = runFailTask('hubRunLegacyFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('flowName property is required')
        result.task(":hubRunLegacyFlow").outcome == FAILED
    }

    def "test run flow when hub not installed"() {
        given:
        BaseTest.propertiesFile << """
                ext {
                    entityName=my-entity
                    flowName=my-flow
                }
            """

        when:
        def result = runFailTask('hubRunLegacyFlow')

        then:
        notThrown(UnexpectedBuildSuccess)
        result.output.contains('Data Hub is not installed')
        result.task(":hubRunLegacyFlow").outcome == FAILED
    }

}
