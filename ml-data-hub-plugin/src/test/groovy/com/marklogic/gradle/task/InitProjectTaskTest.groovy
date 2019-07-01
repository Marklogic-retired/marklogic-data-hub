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

import static org.gradle.testkit.runner.TaskOutcome.SUCCESS

class InitProjectTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
    }

    def "init a hub project"() {

        when: "we begin"
            File hubConfigDir = new File(testProjectDir.root, HubConfig.HUB_CONFIG_DIR)
            File userConfigDir = new File(testProjectDir.root, HubConfig.USER_CONFIG_DIR)
        then:
            hubConfigDir.isDirectory() == false
            userConfigDir.isDirectory() == false

        when:
        def result
        try {
            result = runTask('hubInit')
        }
        catch (Exception e) {
            e.printStackTrace()
        }

        then:
            notThrown(UnexpectedBuildFailure)
            result.task(":hubInit").outcome == SUCCESS
            hubConfigDir.isDirectory() == true
            userConfigDir.isDirectory() == true

    }
}
