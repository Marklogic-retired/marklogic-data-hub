package com.marklogic.gradle.task

import com.marklogic.hub.Scaffolding;
import com.marklogic.hub.PluginFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.client.io.Format;

import org.gradle.api.tasks.TaskAction

class CreateFlowTask extends HubTask {

    void createFlow(FlowType flowType) {
        def entityName = project.hasProperty("entityName") ? project.property("entityName") : null
        if (entityName == null) {
            println "entityName property is required."
            return
        }
        def flowName = project.hasProperty("flowName") ? project.property("flowName") : null
        if (flowName == null) {
            println "flowName property is required."
            return
        }

        def pluginFormat = project.hasProperty("pluginFormat") ?
            PluginFormat.getPluginFormat(project.property("pluginFormat")) : PluginFormat.JAVASCRIPT

        def dataFormatStr = project.hasProperty("dataFormat") ?
            project.property("dataFormat") : "json"

        def dataFormat = null
        switch(dataFormatStr) {
            case "json":
                dataFormat = Format.JSON
            break
            case "xml":
                dataFormat = Format.XML
            break
            default:
                dataFormat = Format.UNKNOWN
            break
        }
        if (dataFormat.equals(Format.UNKNOWN)) {
            println "invalid dataFormat: " + dataFormatStr
            return
        }

        def userlandPath = new File(getHubConfig().modulesPath)
        Scaffolding.createFlow(entityName, flowName, flowType, pluginFormat, dataFormat, userlandPath)
    }
}
