package com.marklogic.hub.web.model;

import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.HubConfigImpl;

/**
 * A transport object that matches up with the Hubsettings typescript model
 */
public class HubSettings {

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

    public String getModulesDbName() {
        return modulesDbName;
    }

    public void setModulesDbName(String modulesDbName) {
        this.modulesDbName = modulesDbName;
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

    public HubSettings() {
        HubConfig config = new HubConfigImpl();
        host = config.getHost();
        stagingDbName = config.getDbName(DatabaseKind.STAGING);
        stagingTriggersDbName = config.getDbName(DatabaseKind.STAGING_TRIGGERS);
        stagingSchemasDbName = config.getDbName(DatabaseKind.STAGING_SCHEMAS);
        stagingHttpName = config.getHttpName(DatabaseKind.STAGING);
        stagingForestsPerHost = config.getForestsPerHost(DatabaseKind.STAGING);
        stagingPort = config.getPort(DatabaseKind.STAGING);
        stagingAuthMethod = config.getAuthMethod(DatabaseKind.STAGING);

        finalDbName = config.getDbName(DatabaseKind.FINAL);
        finalTriggersDbName = config.getDbName(DatabaseKind.FINAL_TRIGGERS);
        finalSchemasDbName = config.getDbName(DatabaseKind.FINAL_SCHEMAS);
        finalHttpName = config.getHttpName(DatabaseKind.FINAL);
        finalForestsPerHost = config.getForestsPerHost(DatabaseKind.FINAL);
        finalPort = config.getPort(DatabaseKind.FINAL);
        finalAuthMethod = config.getAuthMethod(DatabaseKind.FINAL);

        jobDbName = config.getDbName(DatabaseKind.JOB);
        jobHttpName = config.getHttpName(DatabaseKind.JOB);
        jobForestsPerHost = config.getForestsPerHost(DatabaseKind.JOB);
        jobPort = config.getPort(DatabaseKind.JOB);
        jobAuthMethod = config.getAuthMethod(DatabaseKind.JOB);

        modulesDbName = config.getDbName(DatabaseKind.MODULES);

        username = config.getFlowOperatorUserName();
    }

    String host;
    String name = "data-hub";
    String stagingDbName;
    String stagingTriggersDbName;
    String stagingSchemasDbName;
    String stagingHttpName;
    Integer stagingForestsPerHost;
    Integer stagingPort;
    String stagingAuthMethod;

    String finalDbName;
    String finalTriggersDbName;
    String finalSchemasDbName;
    String finalHttpName;
    Integer finalForestsPerHost;
    Integer finalPort;
    String finalAuthMethod;

    String jobDbName;
    String jobHttpName;
    Integer jobForestsPerHost;
    Integer jobPort;
    String jobAuthMethod;

    String modulesDbName;

    String username;

    String projectDir = null;
}
