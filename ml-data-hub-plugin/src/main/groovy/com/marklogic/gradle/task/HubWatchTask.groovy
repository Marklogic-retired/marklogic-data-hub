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

import com.marklogic.gradle.task.client.WatchTask
import com.marklogic.hub.HubConfig
import com.marklogic.hub.deploy.commands.LoadUserStagingModulesCommand
import org.gradle.api.tasks.TaskAction

/**
 * Extends the ml-gradle WatchTask so that hub modules - those in the plugins directory - can be loaded as well.
 * Often useful to run with the Gradle "-i" flag so you can see which modules are loaded.
 */
class HubWatchTask extends WatchTask {

    LoadUserStagingModulesCommand command

    @Override
    @TaskAction
    void watchModules() {
        HubConfig hubConfig = getProject().property("hubConfig")
        command = new LoadUserStagingModulesCommand(hubConfig)
        println "Watching hub modules in path: " + hubConfig.getHubPluginsDir()
    }

    @Override
    void afterModulesLoaded() {
        super.afterModulesLoaded()
        command.execute(getCommandContext())
    }
}
