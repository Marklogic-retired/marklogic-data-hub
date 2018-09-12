package com.marklogic.quickstart.model;

import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;

/**
 * A transport object that matches up with the Hubsettings typescript model
 */
public class HubSettings {

    public static HubSettings fromHubConfig(HubConfig config) {
        HubSettings settings = new HubSettings();
        settings.host = config.getHost();
        settings.stagingDbName = config.getDbName(DatabaseKind.STAGING);
        settings.stagingModulesDbName = config.getDbName(DatabaseKind.STAGING_MODULES);
        settings.stagingTriggersDbName = config.getDbName(DatabaseKind.STAGING_TRIGGERS);
        settings.stagingSchemasDbName = config.getDbName(DatabaseKind.STAGING_SCHEMAS);
        settings.stagingHttpName = config.getHttpName(DatabaseKind.STAGING);
        settings.stagingForestsPerHost = config.getForestsPerHost(DatabaseKind.STAGING);
        settings.stagingPort = config.getPort(DatabaseKind.STAGING);
        settings.stagingAuthMethod = config.getAuthMethod(DatabaseKind.STAGING);

        settings.finalDbName = config.getDbName(DatabaseKind.FINAL);
        settings.finalModulesDbName = config.getDbName(DatabaseKind.FINAL_MODULES);
        settings.finalTriggersDbName = config.getDbName(DatabaseKind.FINAL_TRIGGERS);
        settings.finalSchemasDbName = config.getDbName(DatabaseKind.FINAL_SCHEMAS);
        settings.finalHttpName = config.getHttpName(DatabaseKind.FINAL);
        settings.finalForestsPerHost = config.getForestsPerHost(DatabaseKind.FINAL);
        settings.finalPort = config.getPort(DatabaseKind.FINAL);
        settings.finalAuthMethod = config.getAuthMethod(DatabaseKind.FINAL);

        settings.jobDbName = config.getDbName(DatabaseKind.JOB);
        settings.jobHttpName = config.getHttpName(DatabaseKind.JOB);
        settings.jobForestsPerHost = config.getForestsPerHost(DatabaseKind.JOB);
        settings.jobPort = config.getPort(DatabaseKind.JOB);
        settings.jobAuthMethod = config.getAuthMethod(DatabaseKind.JOB);

        settings.username = config.getHubUserName();
        settings.projectDir = config.getProjectDir();
        return settings;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStagingDbName() {
        return stagingDbName;
    }

    public void setStagingDbName(String stagingDbName) {
        this.stagingDbName = stagingDbName;
    }

    public String getStagingModulesDbName() {
        return stagingModulesDbName;
    }

    public void setStagingModulesDbName(String stagingModulesDbName) {
        this.stagingModulesDbName = stagingModulesDbName;
    }

    public String getStagingTriggersDbName() {
        return stagingTriggersDbName;
    }

    public void setStagingTriggersDbName(String stagingTriggersDbName) {
        this.stagingTriggersDbName = stagingTriggersDbName;
    }

    public String getStagingSchemasDbName() {
        return stagingSchemasDbName;
    }

    public void setStagingSchemasDbName(String stagingSchemasDbName) {
        this.stagingSchemasDbName = stagingSchemasDbName;
    }


    public String getStagingHttpName() {
        return stagingHttpName;
    }

    public void setStagingHttpName(String stagingHttpName) {
        this.stagingHttpName = stagingHttpName;
    }

    public Integer getStagingForestsPerHost() {
        return stagingForestsPerHost;
    }

    public void setStagingForestsPerHost(Integer stagingForestsPerHost) {
        this.stagingForestsPerHost = stagingForestsPerHost;
    }

    public Integer getStagingPort() {
        return stagingPort;
    }

    public void setStagingPort(Integer stagingPort) {
        this.stagingPort = stagingPort;
    }

    public String getStagingAuthMethod() {
        return stagingAuthMethod;
    }

    public void setStagingAuthMethod(String stagingAuthMethod) {
        this.stagingAuthMethod = stagingAuthMethod;
    }

    public String getFinalDbName() {
        return finalDbName;
    }

    public void setFinalDbName(String finalDbName) {
        this.finalDbName = finalDbName;
    }

    public String getFinalModulesDbName() {
        return finalModulesDbName;
    }

    public void setFinalModulesDbName(String finalModulesDbName) {
        this.finalModulesDbName = finalModulesDbName;
    }

    public String getFinalTriggersDbName() {
        return finalTriggersDbName;
    }

    public void setFinalTriggersDbName(String finalTriggersDbName) {
        this.finalTriggersDbName = finalTriggersDbName;
    }

    public String getFinalSchemasDbName() {
        return finalSchemasDbName;
    }

    public void setFinalSchemasDbName(String finalSchemasDbName) {
        this.finalSchemasDbName = finalSchemasDbName;
    }

    public String getFinalHttpName() {
        return finalHttpName;
    }

    public void setFinalHttpName(String finalHttpName) {
        this.finalHttpName = finalHttpName;
    }

    public Integer getFinalForestsPerHost() {
        return finalForestsPerHost;
    }

    public void setFinalForestsPerHost(Integer finalForestsPerHost) {
        this.finalForestsPerHost = finalForestsPerHost;
    }

    public Integer getFinalPort() {
        return finalPort;
    }

    public void setFinalPort(Integer finalPort) {
        this.finalPort = finalPort;
    }

    public String getFinalAuthMethod() {
        return finalAuthMethod;
    }

    public void setFinalAuthMethod(String finalAuthMethod) {
        this.finalAuthMethod = finalAuthMethod;
    }

    public String getJobDbName() {
        return jobDbName;
    }

    public void setJobDbName(String jobDbName) {
        this.jobDbName = jobDbName;
    }

    public String getJobHttpName() {
        return jobHttpName;
    }

    public void setJobHttpName(String jobHttpName) {
        this.jobHttpName = jobHttpName;
    }

    public Integer getJobForestsPerHost() {
        return jobForestsPerHost;
    }

    public void setJobForestsPerHost(Integer jobForestsPerHost) {
        this.jobForestsPerHost = jobForestsPerHost;
    }

    public Integer getJobPort() {
        return jobPort;
    }

    public void setJobPort(Integer jobPort) {
        this.jobPort = jobPort;
    }

    public String getJobAuthMethod() {
        return jobAuthMethod;
    }

    public void setJobAuthMethod(String jobAuthMethod) {
        this.jobAuthMethod = jobAuthMethod;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getProjectDir() {
        return projectDir;
    }

    public void setProjectDir(String projectDir) {
        this.projectDir = projectDir;
    }

    String host = null;
    String name = "data-hub";

    String stagingDbName = null;
    String stagingModulesDbName = null;
    String stagingTriggersDbName = null;
    String stagingSchemasDbName = null;
    String stagingHttpName = null;
    Integer stagingForestsPerHost = null;
    Integer stagingPort = null;
    String stagingAuthMethod = null;

    String finalDbName = null;
    String finalModulesDbName = null;
    String finalTriggersDbName = null;
    String finalSchemasDbName = null;
    String finalHttpName = null;
    Integer finalForestsPerHost = null;
    Integer finalPort = null;
    String finalAuthMethod = null;

    String jobDbName = null;
    String jobHttpName = null;
    Integer jobForestsPerHost = null;
    Integer jobPort = null;
    String jobAuthMethod = null;

    String username = null;
    String projectDir = null;
}
