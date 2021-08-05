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

import com.marklogic.hub.provenance.ProvenanceManager
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class DeleteProvenanceTask extends AbstractConfirmableHubTask {
    @Override
    void executeIfConfirmed() {
        def propName = "retainDuration"
        def database = "provenanceDatabase"
        if (!project.hasProperty(propName)) {
            throw new GradleException("Please specify a duration via -PretainDuration=(value in format of PnYnM or PnDTnHnMnS)")
        }
        def provManager = new ProvenanceManager(getHubConfig().newHubClient());
        if (project.hasProperty(database)) {
            provManager.deleteProvenanceRecords(project.property(propName), project.property(database))
        } else {
            provManager.deleteProvenanceRecords(project.property(propName))
        }
    }
}
