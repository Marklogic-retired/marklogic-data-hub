package com.marklogic.gradle

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.slf4j.LoggerFactory

import com.marklogic.hub.DefaultHubConfigFactory
import com.marklogic.hub.DataHub;
import com.marklogic.gradle.task.InstallHubTask;
import com.marklogic.gradle.task.UninstallHubTask;
import com.marklogic.gradle.task.CreateEntityTask;
import com.marklogic.gradle.task.CreateHarmonizeFlowTask;
import com.marklogic.gradle.task.CreateInputFlowTask;
import com.marklogic.gradle.task.RunFlowTask;
import com.marklogic.gradle.task.EnableDebuggingTask;
import com.marklogic.gradle.task.DisableDebuggingTask;
import com.marklogic.gradle.task.EnableTracingTask;
import com.marklogic.gradle.task.DisableTracingTask;
import com.marklogic.hub.HubConfig;
import com.marklogic.gradle.ProjectPropertySource;

class DataHubPlugin implements Plugin<Project> {

    org.slf4j.Logger logger = LoggerFactory.getLogger(getClass())

    void apply(Project project) {
        logger.info("\nInitializing data-hub-gradle")

        HubConfig hubConfig = new DefaultHubConfigFactory(new ProjectPropertySource(project)).newHubConfig()
        project.extensions.add("hubConfig", hubConfig)

        DataHub hub = new DataHub(hubConfig);
        project.extensions.add("dataHub", hub);

        String deployGroup = "MarkLogic Data Hub Deploy"
        // No group or description on these so they don't show up in "gradle tasks"
        project.task("installHub", group: deployGroup, type: InstallHubTask)
        project.task("uninstallHub", group: deployGroup, type: UninstallHubTask)
        project.task("enableDebugging", group: deployGroup, type: EnableDebuggingTask)
        project.task("disableDebugging", group: deployGroup, type: DisableDebuggingTask)
        project.task("enableTracing", group: deployGroup, type: EnableTracingTask)
        project.task("disableTracing", group: deployGroup, type: DisableTracingTask)

        String scaffoldGroup = "MarkLogic Data Hub Scaffolding"
        project.task("createEntity", group: scaffoldGroup, type: CreateEntityTask)
        project.task("createHarmonizeFlow", group: scaffoldGroup, type: CreateHarmonizeFlowTask)
        project.task("createInputFlow", group: scaffoldGroup, type: CreateInputFlowTask)

        String flowGroup = "MarkLogic Data Hub Flow Management"
        // No group or description on these so they don't show up in "gradle tasks"
        project.task("runFlow", group: flowGroup, type: RunFlowTask)

        logger.info("Finished initializing ml-gradle\n")
    }
}
