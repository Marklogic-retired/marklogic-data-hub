package com.marklogic.gradle.task.nifi


import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.nifi.NifiTemplateGenerator
import org.gradle.api.GradleException
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

class GenerateNifiTemplateTask extends HubTask {

    @Input
    public String flowUri

    @Input
    public String templatePath

    @TaskAction
    void generateNifiTemplate() {
        if (flowUri == null) {
            flowUri = project.hasProperty("flowUri") ? project.property("flowUri") : null
        }
        if (flowUri == null) {
            throw new GradleException("The flowUri property is required; it is the URI of the flow for which you want " +
                "to generate a NiFi template. Define the parameter with e.g. -PflowUri=/flows/my-flow.flow.json")
        }

        if (templatePath == null) {
            templatePath = project.hasProperty("templatePath") ? project.property("templatePath") : null
        }
        if (templatePath == null) {
            throw new GradleException("The templatePath property is required; it is the file path to which you want to write " +
                "the generated NiFi template. Define the parameter with e.g. -PtemplatePath=build/my-template.xml")
        }

        String template = new NifiTemplateGenerator(getStagingClient()).generateNiFiTemplate(flowUri)

        def file = new File(templatePath)
        file.write(template)
        println "Wrote template to path: " + templatePath
        println "\nAfter loading the template into NiFi and creating a new process group from it, you will need to make some modifications to the process group." +
            "\nFirst, if your flow has an ingestion step, verify that the 'Input Directory' in the 'Get Files' processor points to an absolute path." +
            "\nNext, set the 'Password' property in the 'DatabaseClient-STAGING' controller service and then enable the service." +
            "\nFinally, set the 'Basic Authentication Password' property in each instance of the 'InvokeHTTP' processor." +
            "\nYou will then be ready to run the flow." +
            "\nNote that if you have an ingestion step, you should run that set of processors first before starting the processors " +
            "for the steps that follow it. This ensures that the ingestion completes before the following steps start."
    }
}
