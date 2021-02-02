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


import com.marklogic.hub.StepDefinitionManager
import com.marklogic.hub.scaffold.Scaffolding
import com.marklogic.hub.step.StepDefinition
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class CreateStepDefinitionTask extends HubTask {

    @TaskAction
    void createStepDefinition() {
        def propName = "stepDefName"
        def propType = "stepDefType"
        def propFormat = "format"

        String stepDefName = project.hasProperty(propName) ? project.property(propName).toString() : null
        if (stepDefName == null) {
            throw new GradleException("stepDefName must be defined via -PstepDefName=YourStepDefName")
        }

        String stepDefType = project.hasProperty(propType) ? project.property(propType).toString() : StepDefinition.StepDefinitionType.CUSTOM
        if (!"ingestion".equalsIgnoreCase(stepDefType) && !"custom".equalsIgnoreCase(stepDefType)) {
            throw new GradleException("stepDefType must have a value of either 'ingestion' or 'custom'")
        }

        StepDefinitionManager stepDefinitionManager = getStepDefinitionManager()
        StepDefinition stepDefinition = StepDefinition.create(stepDefName, StepDefinition.StepDefinitionType.getStepDefinitionType(stepDefType))

        if (stepDefinitionManager.getStepDefinition(stepDefinition.name, stepDefinition.type) != null) {
            throw new GradleException("A step definition already exists with the name '${stepDefName}' and type '${stepDefType}'")
        }

        String format = project.hasProperty(propFormat) ? project.property(propFormat) : "sjs"
        if (!"sjs".equalsIgnoreCase(format) && !"xqy".equalsIgnoreCase(format)) {
            throw new GradleException("format must have a value of either 'sjs' or 'xqy'")
        }

        Scaffolding scaffolding = getScaffolding()
        stepDefinition.setModulePath("/custom-modules/" + stepDefType.toLowerCase() + "/" + stepDefName + "/main.sjs")
        stepDefinitionManager.saveStepDefinition(stepDefinition)
        scaffolding.createCustomModule(stepDefName, stepDefType, format)
    }
}
