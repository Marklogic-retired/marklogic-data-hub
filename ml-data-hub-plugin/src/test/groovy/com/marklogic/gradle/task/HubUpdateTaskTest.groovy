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


import org.apache.commons.io.FileUtils

import static org.gradle.testkit.runner.TaskOutcome.FAILED

class HubUpdateTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        // this will be relatively fast (idempotent) for already-installed hubs
        println(runTask('hubInstallModules', '-i').getOutput())
        println(runTask('mlLoadModules', '-i').getOutput())
    }
    
    //if 4.0 project is upgraded, remove the backed up directories
    def setup() {
        File hubConfigDir = hubConfig().hubProject.projectDir.resolve("src/main/hub-internal-config-" + hubConfig().getDHFVersion()).toFile()
        File mlConfigDir = hubConfig().hubProject.projectDir.resolve("src/main/ml-config-" + hubConfig().getDHFVersion()).toFile()
        if (hubConfigDir.exists() && mlConfigDir.exists()) {
            FileUtils.forceDelete(hubConfigDir)
            FileUtils.forceDelete(mlConfigDir)
        }
    }

    def "can only update 4.3.x "() {
        given:
        def gradlePropsFile = testProjectDir.getRoot().toPath().resolve("gradle.properties")
        gradlePropsFile.toFile().append("\nmlDHFVersion=4.2.2");
        hubConfig().refreshProject(null, true)
        when:
        def result = runFailTask("hubUpdate")

        then:
        result.output.contains('Can\'t upgrade hub version')
        result.output.contains('4.2.2')
        result.task(":hubUpdate").outcome == FAILED
    }
}
