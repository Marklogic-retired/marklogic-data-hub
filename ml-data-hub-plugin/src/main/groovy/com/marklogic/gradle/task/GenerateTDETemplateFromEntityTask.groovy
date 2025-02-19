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

import com.marklogic.hub.deploy.commands.GenerateHubTDETemplateCommand
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.Optional
import org.gradle.api.tasks.TaskAction

class GenerateTDETemplateFromEntityTask extends HubTask {

    @Input
    @Optional
    String entityNames

    @TaskAction
    void generateTDETEmplates() {
        def cmd = new GenerateHubTDETemplateCommand(getHubConfig())
        if (entityNames == null) {
            entityNames = project.hasProperty("entityNames") ? project.property("entityNames") : null
        }
        cmd.setEntityNames(entityNames)
        cmd.execute(getCommandContext())
    }

}
