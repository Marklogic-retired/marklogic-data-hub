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

class DeployHubArtifactTaskTest extends BaseTest {
    def setupSpec() {
        createGradleFiles()
        runTask('hubInit')
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    def "deploy hub artifacts"() {
        given:
        getStagingDocCount("http://marklogic.com/data-hub/step-definition") == 0
        getStagingDocCount("http://marklogic.com/data-hub/flow") == 0
        def modCount = getModulesDocCount();
        when:
        def result = runTask('hubDeployArtifacts')

        then:
        notThrown(UnexpectedBuildFailure)
        result.task(":hubDeployArtifacts").outcome == SUCCESS

        // Steps ingest, mapping, and master
        getStagingDocCount("http://marklogic.com/data-hub/step-definition") == 3
        // Flows ingest, mapping, mastering, map-and-master
        getStagingDocCount("http://marklogic.com/data-hub/flow") == 4
        getModulesDocCount() == modCount
    }

}
