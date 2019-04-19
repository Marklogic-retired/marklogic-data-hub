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

import com.marklogic.gradle.exception.StepDefNameRequiredException
import com.marklogic.gradle.exception.StepDefTypeInvalidException
import com.marklogic.gradle.exception.StepDefinitionAlreadyPresentException
import com.marklogic.hub.StepDefinitionManager
import com.marklogic.hub.scaffold.Scaffolding
import com.marklogic.hub.step.StepDefinition
import org.gradle.api.tasks.TaskAction

class CreateStepDefinitionTask extends HubTask {

    @TaskAction
    void createStepDefinition() {
        def propName = "stepDefName"
        def propType = "stepDefType"

        String stepDefName = project.hasProperty(propName) ? project.property(propName) : null
        if (stepDefName == null) {
            throw new StepDefNameRequiredException()
        }
        String stepDefType = project.hasProperty(propType) ? project.property(propType) : StepDefinition.StepDefinitionType.CUSTOM

        if(!StepDefinition.StepDefinitionType.getStepDefinitionType(stepDefType)) {
            throw new StepDefTypeInvalidException()
        }

        def projectDir = getHubConfig().getHubProject().getProjectDirString()
        println "stepDefName: " + stepDefName
        println "stepDefType: " + stepDefType
        println "projectDir: " + projectDir.toString()

        StepDefinitionManager stepDefinitionManager = getStepDefinitionManager()
        StepDefinition stepDefinition = StepDefinition.create(stepDefName.toString(), StepDefinition.StepDefinitionType.getStepDefinitionType(stepDefType))

        if (stepDefinitionManager.getStepDefinition(stepDefinition.name, stepDefinition.type) == null) {
            Scaffolding scaffolding = getScaffolding()
            scaffolding.createCustomModule(stepDefName, stepDefType)

            stepDefinition.setModulePath("/custom-modules/" + stepDefType.toLowerCase() + "/" + stepDefName + "/main.sjs")

            stepDefinitionManager.saveStepDefinition(stepDefinition)
        }
        else {
            throw new StepDefinitionAlreadyPresentException()
        }

    }
}
