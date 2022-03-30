/*
 * Copyright (c) 2021 MarkLogic Corporation
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

class ExportProjectTaskTest extends BaseTest {

    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
        runTask('hubDeployUserArtifacts')
    }

    def "export a hub project"() {

        when: "we begin"
            File exportFile = hubConfig().getHubProject().projectDir.resolve("build").resolve("datahub-project.zip").toFile()

        then:
            exportFile.exists() == false;

        when:
        def result
        try {
            result = runTask('hubExportProject')
        }
        catch (Exception e) {
            e.printStackTrace()
        }
        then:
            exportFile.exists() == true;

    }
}
