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
import org.gradle.testkit.runner.UnexpectedBuildFailure

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class BasicAuthTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask("hubInit")
        println(BaseTest.testProjectDir.getRoot().getAbsolutePath());
        createProperties()
    }

    def cleanupSpec() {
        runTask('mlUndeploy', '-Pconfirm=true')
    }

    void createProperties() {
        BaseTest.propertiesFile = new File(BaseTest.testProjectDir.root, 'gradle.properties')
        BaseTest.propertiesFile << """
            mlStagingAuth=basic
            mlFinalAuth=basic
            mlJobAuth=basic
        """
    }

    def "bootstrap a project with basic auth"() {
        when:
        def result = runTask('mlDeploy')
        print(result.output)

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":mlDeploy").outcome == SUCCESS
    }

}
