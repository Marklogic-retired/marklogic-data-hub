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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.marklogic.appdeployer.command.CommandContext
import com.marklogic.client.DatabaseClient
import com.marklogic.hub.*
import com.marklogic.hub.deploy.commands.LoadHubArtifactsCommand
import com.marklogic.hub.deploy.commands.LoadHubModulesCommand
import com.marklogic.hub.deploy.commands.LoadUserArtifactsCommand
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand
import com.marklogic.hub.impl.Scaffolding
import org.gradle.api.DefaultTask
import org.gradle.api.GradleException
import org.gradle.api.tasks.Internal

abstract class HubTask extends DefaultTask {

    String getRequiredPropertyValue(propertyName, errorMessage) {
        def value = getOptionalPropertyValue(propertyName)
        if (value == null) {
            throw new GradleException(errorMessage)
        }
        return value
    }

    String getOptionalPropertyValue(String propertyName) {
        return project.hasProperty(propertyName) ? project.property(propertyName).toString() : null
    }

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
    LoadHubArtifactsCommand getLoadHubArtifactsCommand() {
        getProject().property("loadHubArtifactsCommand")
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
    MasteringManager getMasteringManager() {
        getProject().property("masteringManager")
    }

    @Internal
    EntityManager getEntityManager() {
        getProject().property("entityManager")
    }

    @Internal
    FlowManager getFlowManager() {
        getProject().property("flowManager")
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
