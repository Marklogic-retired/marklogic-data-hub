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

import com.marklogic.gradle.exception.EntityNameRequiredException
import com.marklogic.gradle.exception.FlowNameRequiredException
import com.marklogic.hub.legacy.flow.CodeFormat
import com.marklogic.hub.legacy.flow.DataFormat
import com.marklogic.hub.legacy.flow.FlowType
import com.marklogic.hub.scaffold.Scaffolding
import org.gradle.api.tasks.Input

abstract class CreateLegacyFlowTask extends HubTask {

    @Input
    public Boolean useES


    void createFlow(FlowType flowType) {
        def entityName = project.hasProperty("entityName") ? project.property("entityName") : null
        if (entityName == null) {
            throw new EntityNameRequiredException()
        }
        def flowName = project.hasProperty("flowName") ? project.property("flowName") : null
        if (flowName == null) {
            throw new FlowNameRequiredException()
        }

        def pluginFormat = project.hasProperty("pluginFormat") ?
            CodeFormat.getCodeFormat(project.property("pluginFormat")) : CodeFormat.JAVASCRIPT

        def dataFormatStr = project.hasProperty("dataFormat") ?
            project.property("dataFormat") : "json"

        def dataFormat
        switch(dataFormatStr) {
            case "json":
                dataFormat = DataFormat.JSON
            break
            case "xml":
                dataFormat = DataFormat.XML
            break
            default:
                println "invalid dataFormat: " + dataFormatStr
                return
        }

        if (useES == null) {
            useES = project.hasProperty("useES") ?
                Boolean.parseBoolean(project.property("useES")) : true
        }

        def mappingName = project.hasProperty("mappingName") ? project.property("mappingName") : null

        def withMapping = ""
        if(mappingName != null){
            withMapping = " with mapping: " + mappingName
        }

        Scaffolding scaffolding = getScaffolding()
        println "Creating an " + pluginFormat + " " + flowType + " flow named " + flowName + " for entity " + entityName + withMapping
        scaffolding.createLegacyFlow(entityName, flowName, flowType, pluginFormat, dataFormat, useES, mappingName)
    }
}
