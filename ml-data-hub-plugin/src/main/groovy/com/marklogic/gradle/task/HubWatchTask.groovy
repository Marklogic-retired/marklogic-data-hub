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


import com.marklogic.gradle.task.client.WatchTask
import com.marklogic.hub.HubConfig
import com.marklogic.hub.deploy.commands.GenerateFunctionMetadataCommand
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand
import com.marklogic.hub.deploy.util.ModuleWatchingConsumer
import com.marklogic.hub.impl.Versions

/**
 * Extends ml-gradle's WatchTask so that after WatchTask loads modules, this task can invoke the custom DHF command for
 * loading modules. The reason this is needed is because WatchTask doesn't just invoke all the commands in the
 * "mlModuleCommands" list - it may be enhanced in the future to do that. But currently, it accesses the ModulesLoader
 * that's created by LoadModulesCommand and invokes it.
 */
class HubWatchTask extends WatchTask {

    LoadUserModulesCommand command

    HubWatchTask() {
        HubConfig hubConfig = getProject().property("hubConfig")
        Versions versions = getProject().property("dataHubApplicationContext").getBean(Versions.class)
        GenerateFunctionMetadataCommand command = new GenerateFunctionMetadataCommand(hubConfig.newModulesDbClient(), versions)
        onModulesLoaded = new ModuleWatchingConsumer(getCommandContext(), command)
    }

    @Override
    void afterModulesLoaded() {
        super.afterModulesLoaded()

        if (command == null) {
            command = getProject().property("loadUserModulesCommand")
            command.setWatchingModules(true)
        }

        command.execute(getCommandContext())
    }
}
