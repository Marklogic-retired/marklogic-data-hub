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

import com.marklogic.gradle.exception.ProcessAlreadyPresentException
import com.marklogic.gradle.exception.ProcessNameRequiredException
import com.marklogic.hub.ProcessManager
import com.marklogic.hub.processes.Process
import org.gradle.api.tasks.TaskAction

class CreateProcessTask extends HubTask {

    @TaskAction
    void createProcess() {
        def propName = "processName"
        def propType = "processType"
        def processName = project.hasProperty(propName) ? project.property(propName) : null
        if (processName == null) {
            throw new ProcessNameRequiredException()
        }
        def processType = project.hasProperty(propType) ? project.property(propType) : Process.ProcessType.CUSTOM

        def projectDir = getHubConfig().getHubProject().getProjectDirString()
        println "processName: " + processName
        println "processType: " + processType
        println "projectDir: " + projectDir.toString()

        ProcessManager processManager = getProcessManager()
        Process process = Process.create(processName.toString(), Process.ProcessType.getProcessType(processType.toString()))

        if (processManager.getProcess(process.name, process.type) == null) {
            processManager.saveProcess(process)
        }
        else {
            throw new ProcessAlreadyPresentException()
        }

    }
}
