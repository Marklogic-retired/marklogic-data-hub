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

package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.flow.JobManager
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class DeleteJobsTask extends HubTask {

    @TaskAction
    void deleteJobs() {
        def propName = "retainDuration"
        if (!project.hasProperty(propName)) {
            throw new GradleException("Please specify a duration via -PretainDuration=(value in format of PnYnM or PnDTnHnMnS)")
        }
        new JobManager(getHubConfig().newHubClient()).deleteJobs(project.property(propName))
    }
}
