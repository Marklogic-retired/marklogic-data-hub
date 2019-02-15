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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.marklogic.appdeployer.command.CommandContext
import com.marklogic.client.DatabaseClient
import com.marklogic.hub.*
import com.marklogic.hub.deploy.commands.GeneratePiiCommand
import com.marklogic.hub.deploy.commands.LoadHubModulesCommand
import com.marklogic.hub.deploy.commands.LoadUserArtifactsCommand
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand
import com.marklogic.hub.legacy.LegacyDebugging
import com.marklogic.hub.legacy.LegacyFlowManager
import com.marklogic.hub.legacy.LegacyTracing
import com.marklogic.hub.legacy.job.LegacyJobManager
import com.marklogic.hub.scaffold.Scaffolding
import org.gradle.api.DefaultTask
import org.gradle.api.tasks.Internal

abstract class HubTask extends DefaultTask {

    @Internal
    HubConfig getHubConfig() {
        getProject().property("hubConfig")
    }
    
    @Internal
    HubProject getHubProject() {
        getProject().property("hubProject")
    }

    @Internal
    DataHub getDataHub() {
        getProject().property("dataHub")
    }

    @Internal
    Scaffolding getScaffolding() {
        getProject().property("scaffolding")
    }

    @Internal
    LoadHubModulesCommand getLoadHubModulesCommand() {
        getProject().property("loadHubModulesCommand")
    }

    @Internal
    LoadUserModulesCommand getLoadUserModulesCommand() {
        getProject().property("loadUserModulesCommand")
    }

    @Internal
    LoadUserArtifactsCommand getLoadUserArtifactsCommand() {
        getProject().property("loadUserArtifactsCommand")
    }

    @Internal
    MappingManager getMappingManager() {
        getProject().property("mappingManager")
    }

    @Internal
    StepManager getStepManager() {
        getProject().property("stepManager")
    }
    
    @Internal
    EntityManager getEntityManager() {
        getProject().property("entityManager")
    }
    
    @Internal
    GeneratePiiCommand getGeneratePiiCommand() {
        getProject().property("generatePiiCommand")
    }

    @Internal
    LegacyTracing getLegacyTracing() {
        return LegacyTracing.create(getStagingClient())
    }

    @Internal
    LegacyDebugging getLegacyDebugging() {
        return LegacyDebugging.create(getStagingClient())
    }

    @Internal
    FlowManager getFlowManager() {
        getProject().property("flowManager")
    }

    @Internal
    LegacyFlowManager getLegacyFlowManager() {
        getProject().property("legacyFlowManager")
    }

    @Internal
    LegacyJobManager getJobManager() {
        return LegacyJobManager.create(getHubConfig().newJobDbClient());
    }

    @Internal
    DatabaseClient getStagingClient() {
        return getHubConfig().newStagingClient()
    }

    @Internal
    // all the groovy tasks that getFinalClient actually need the DHF modules.
    DatabaseClient getFinalClient() {
        return getHubConfig().newReverseFlowClient()
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
            } else {
                jsonObject = mapper.readValue(str, Object.class)
            }
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonObject)
        }
        catch (Exception e) {
            return str
        }
    }

}
