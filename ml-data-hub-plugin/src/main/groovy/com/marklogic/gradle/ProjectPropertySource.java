package com.marklogic.gradle;

import org.gradle.api.Project;

import com.marklogic.mgmt.util.PropertySource;

public class ProjectPropertySource implements PropertySource {

    private Project project;

    public ProjectPropertySource(Project project) {
        this.project = project;
    }

    @Override
    public String getProperty(String name) {
        return project.hasProperty(name) ? project.property(name).toString() : null;
    }

}
