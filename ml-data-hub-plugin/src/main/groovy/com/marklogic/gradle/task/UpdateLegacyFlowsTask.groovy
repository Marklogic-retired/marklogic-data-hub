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

import com.marklogic.hub.impl.HubConfigImpl
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.Optional
import org.gradle.api.tasks.TaskAction

class UpdateLegacyFlowsTask extends HubTask {

    @Input
    @Optional()
    List<String> legacyEntities = new ArrayList<>()

    @Input
    @Optional
    List<String> legacyFlowTypes = new ArrayList<>()

    @Input
    @Optional
    List<String> legacyFlowNames = new ArrayList<>()


    @TaskAction
    void updateLegacyFlows() {
        if(legacyEntities == null || legacyEntities.size() == 0) {
            legacyEntities = project.hasProperty("legacyEntities") ? project.property("legacyEntities").toString().trim().tokenize(",") : new ArrayList<>()
        }

        if(legacyFlowTypes == null || legacyFlowTypes.size() == 0) {
            legacyFlowTypes = project.hasProperty("legacyFlowTypes") ? project.property("legacyFlowTypes").toString().trim().tokenize(",") : new ArrayList<>()
        }

        if(legacyFlowNames == null || legacyFlowNames.size() == 0) {
            legacyFlowNames = project.hasProperty("legacyFlowNames") ? project.property("legacyFlowNames").toString().trim().tokenize(",") : new ArrayList<>()
        }

        println "start upgradeLegacyFlows task ."
        HubConfigImpl config = (HubConfigImpl) getHubConfig()
        int flowsUpdated = getHubProject().upgradeLegacyFlows(getFlowManager(), legacyEntities, legacyFlowTypes, legacyFlowNames, config.getStagingDbName(), config.getFinalDbName())
        if(flowsUpdated == 0) {
            println("No legacy Flows found in plugins/entities directory to upgrade")
        }
        println "upgradeLegacyFlows has completed!"
    }
}
