package com.marklogic.quickstart.model;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.filefilter.WildcardFileFilter;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;

public class Project {

    public int id;
    public String path;
    public List<String> environments;
    public boolean initialized = false;

    public Project(int id, String path) {
        this.id = id;
        this.path = path;
        this.initialized = isInitialized();
        this.environments = getEnvironments();
    }

    public boolean isInitialized() {
        File buildGradle = new File(this.path, "build.gradle");
        File gradleProperties = new File(this.path, "gradle.properties");
        File configDir = new File(this.path, "config");

        return buildGradle.exists() &&
               gradleProperties.exists() &&
               configDir.exists() &&
               configDir.isDirectory();
    }

    public List<String> getEnvironments() {
        ArrayList<String> environments = new ArrayList<String>();
        File dir = new File(this.path);
        String[] files = dir.list(new WildcardFileFilter("gradle-*.properties"));
        for (String file : files) {
            String env = file.replaceAll("^gradle-([^.]+).properties$", "$1");
            environments.add(env);
        }
        return environments;
    }

    public void initialize(HubConfig config) {
        config.projectDir = this.path;
        HubProject hp = new HubProject(config);
        hp.init();
        this.initialized = isInitialized();
    }
}
