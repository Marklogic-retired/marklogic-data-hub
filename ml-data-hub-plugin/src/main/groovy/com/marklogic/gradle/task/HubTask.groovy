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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.marklogic.appdeployer.command.CommandContext
import com.marklogic.client.DatabaseClient
import com.marklogic.hub.*
import com.marklogic.hub.job.JobManager;
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.Internal

abstract class HubTask extends DefaultTask {

    @Internal
    HubConfig getHubConfig() {
        getProject().property("hubConfig")
    }

    @Internal
    DataHub getDataHub() {
        getProject().property("dataHub")
    }

    @Internal
    Tracing getTracing() {
        return Tracing.create(getStagingClient())
    }

    @Internal
    Debugging getDebugging() {
        return Debugging.create(getStagingClient())
    }

    @Internal
    FlowManager getFlowManager() {
        return FlowManager.create(getHubConfig())
    }

    @Internal
    JobManager getJobManager() {
        return JobManager.create(getHubConfig().newJobDbClient());
    }

    @Internal
    DatabaseClient getStagingClient() {
        return getHubConfig().newStagingManageClient()
    }

    @Internal
    DatabaseClient getFinalClient() {
        return getHubConfig().newFinalManageClient()
    }

    @Internal
    CommandContext getCommandContext() {
        getProject().property("mlCommandContext")
    }

    @Internal
    boolean isHubInstalled() {
        InstallInfo installInfo = getDataHub().isInstalled();
        return installInfo.isInstalled();
    }

    String prettyPrint(str) {
        try {
            def jsonObject

            ObjectMapper mapper = new ObjectMapper()
            if (str instanceof JsonNode) {
                jsonObject = str
            }
            else {
                jsonObject = mapper.readValue(str, Object.class)
            }
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonObject)
        }
        catch(Exception e) {
            return str
        }

    }
}
