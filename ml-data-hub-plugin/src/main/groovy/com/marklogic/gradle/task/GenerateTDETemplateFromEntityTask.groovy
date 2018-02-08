package com.marklogic.gradle.task

import com.marklogic.hub.deploy.commands.GenerateHubTDETemplateCommand
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

class GenerateTDETemplateFromEntityTask extends HubTask {

    @Input
    public String entityNames

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
