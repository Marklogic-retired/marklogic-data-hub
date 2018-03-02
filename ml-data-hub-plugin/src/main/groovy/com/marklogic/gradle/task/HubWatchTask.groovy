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

import com.marklogic.hub.deploy.commands.LoadUserModulesCommand
import org.gradle.api.tasks.TaskAction

/**
 * Runs an infinite loop, and each second, it loads any new/modified modules. Often useful to run with the Gradle "-i" flag
 * so you can see which modules are loaded.
 *
 * Depends on an instance of LoadModulesCommand being in the Gradle Project, which should have been placed there by
 * MarkLogicPlugin. This prevents this class from having to know how to construct a ModulesLoader.
 */
class HubWatchTask extends HubTask {

    long sleepTime = 1000

    @TaskAction
    public void watchModules() {

        LoadUserModulesCommand command = new LoadUserModulesCommand(getHubConfig())
        println "Watching modules in paths: " + getHubConfig().projectDir

        while (true) {
            command.execute(getCommandContext())
            try {
                Thread.sleep(sleepTime);
            } catch (InterruptedException ie) {
                // Ignore
            }
        }
    }
}
