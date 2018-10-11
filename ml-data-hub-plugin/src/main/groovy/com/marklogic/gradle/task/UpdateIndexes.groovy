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

import com.marklogic.hub.DataHub
import com.marklogic.hub.deploy.commands.LoadUserStagingModulesCommand
import com.marklogic.hub.impl.DataHubImpl
import com.marklogic.rest.util.ResourcesFragment

import org.gradle.api.tasks.TaskAction

class UpdateIndexes extends HubTask {

    @TaskAction
    public void updateIndexes() {
		println "Deploying Indexes to database"
		DataHub dh = new DataHubImpl(getHubConfig())
		dh.updateIndexes()
		println "Deploying Indexes to database complete"
    }
}
