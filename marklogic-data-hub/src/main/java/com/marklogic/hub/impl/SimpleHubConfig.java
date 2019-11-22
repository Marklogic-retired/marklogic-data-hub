package com.marklogic.hub.impl;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.step.StepDefinition;
import org.springframework.util.Assert;

import java.nio.file.Path;

/**
 * Implementation of HubConfig that does not have a hard dependency on a HubProject. If a HubProject is not set, then
 * any HubConfig method that depends on a HubProject being present will throw an exception.
 */
public class SimpleHubConfig extends AbstractHubConfig {

    private HubProject hubProject;

    public SimpleHubConfig() {
    }

    public SimpleHubConfig(HubProject hubProject) {
        this.hubProject = hubProject;
    }

    protected HubProject requireHubProject() {
        Assert.notNull(hubProject, "A HubProject has not been set, and thus this operation cannot be performed");
        return hubProject;
    }

    @Override
    public String getProjectDir() {
        return requireHubProject().getProjectDirString();
    }

    @Override
    public void setProjectDir(String projectDir) {
        requireHubProject().createProject(projectDir);
    }

    @Override
    public HubProject getHubProject() {
        return hubProject;
    }

    @Override
    public void initHubProject() {
        throw new UnsupportedOperationException();
    }

    @Override
    public String getHubModulesDeployTimestampFile() {
        return requireHubProject().getHubModulesDeployTimestampFile();
    }

    @Override
    public String getUserModulesDeployTimestampFile() {
        return requireHubProject().getUserModulesDeployTimestampFile();
    }

    @Override
    public Path getModulesDir() {
        return requireHubProject().getModulesDir();
    }

    @Override
    public Path getHubPluginsDir() {
        return requireHubProject().getHubPluginsDir();
    }

    @Override
    public Path getHubEntitiesDir() {
        return requireHubProject().getHubEntitiesDir();
    }

    @Override
    public Path getHubMappingsDir() {
        return requireHubProject().getHubMappingsDir();
    }

    @Override
    public Path getStepsDirByType(StepDefinition.StepDefinitionType type) {
        return requireHubProject().getStepsDirByType(type);
    }

    @Override
    public Path getHubConfigDir() {
        return requireHubProject().getHubConfigDir();
    }

    @Override
    public Path getHubDatabaseDir() {
        return requireHubProject().getHubDatabaseDir();
    }

    @Override
    public Path getHubServersDir() {
        return requireHubProject().getHubServersDir();
    }

    @Override
    public Path getHubSecurityDir() {
        return requireHubProject().getHubSecurityDir();
    }

    @Override
    public Path getUserConfigDir() {
        return requireHubProject().getUserConfigDir();
    }

    @Override
    public Path getUserSecurityDir() {
        return requireHubProject().getUserSecurityDir();
    }

    @Override
    public Path getUserDatabaseDir() {
        return requireHubProject().getUserDatabaseDir();
    }

    @Override
    public Path getUserSchemasDir() {
        return requireHubProject().getUserSchemasDir();
    }

    @Override
    public Path getUserServersDir() {
        return requireHubProject().getUserServersDir();
    }

    @Override
    public Path getEntityDatabaseDir() {
        return requireHubProject().getEntityDatabaseDir();
    }

    @Override
    public Path getFlowsDir() {
        return requireHubProject().getFlowsDir();
    }

    @Override
    public Path getStepDefinitionsDir() {
        return requireHubProject().getStepDefinitionsDir();
    }

    @Override
    public void createProject(String projectDirString) {
        requireHubProject().createProject(projectDirString);
    }

    @Override
    public HubConfig withPropertiesFromEnvironment(String environment) {
        requireHubProject().setUserModulesDeployTimestampFile(environment + "-" + USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES);
        return this;
    }

    @Override
    public void refreshProject() {
        // This is only used by QuickStart, but since it doesn't need to technically do anything, no need to throw an
        // UnsupportedOperationException
    }

    public void setHubProject(HubProject hubProject) {
        this.hubProject = hubProject;
    }
}
