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
        settings.stagingHttpName = config.getHttpName(DatabaseKind.STAGING);
        settings.stagingForestsPerHost = config.getForestsPerHost(DatabaseKind.STAGING);
        settings.stagingPort = config.getPort(DatabaseKind.STAGING);
        settings.stagingAuthMethod = config.getAuthMethod(DatabaseKind.STAGING);

        settings.finalDbName = config.getDbName(DatabaseKind.FINAL);
        settings.finalHttpName = config.getHttpName(DatabaseKind.FINAL);
        settings.finalForestsPerHost = config.getForestsPerHost(DatabaseKind.FINAL);
        settings.finalPort = config.getPort(DatabaseKind.FINAL);
        settings.finalAuthMethod = config.getAuthMethod(DatabaseKind.FINAL);

        settings.traceDbName = config.getDbName(DatabaseKind.TRACE);
        settings.traceHttpName = config.getHttpName(DatabaseKind.TRACE);
        settings.traceForestsPerHost = config.getForestsPerHost(DatabaseKind.TRACE);
        settings.tracePort = config.getPort(DatabaseKind.TRACE);
        settings.traceAuthMethod = config.getAuthMethod(DatabaseKind.TRACE);

        settings.jobDbName = config.getDbName(DatabaseKind.JOB);
        settings.jobHttpName = config.getHttpName(DatabaseKind.JOB);
        settings.jobForestsPerHost = config.getForestsPerHost(DatabaseKind.JOB);
        settings.jobPort = config.getPort(DatabaseKind.JOB);
        settings.jobAuthMethod = config.getAuthMethod(DatabaseKind.JOB);

        settings.modulesDbName = config.getDbName(DatabaseKind.MODULES);
        settings.triggersDbName = config.getDbName(DatabaseKind.TRIGGERS);
        settings.schemasDbName = config.getDbName(DatabaseKind.SCHEMAS);

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

    public String getTraceDbName() {
        return traceDbName;
    }

    public void setTraceDbName(String traceDbName) {
        this.traceDbName = traceDbName;
    }

    public String getTraceHttpName() {
        return traceHttpName;
    }

    public void setTraceHttpName(String traceHttpName) {
        this.traceHttpName = traceHttpName;
    }

    public Integer getTraceForestsPerHost() {
        return traceForestsPerHost;
    }

    public void setTraceForestsPerHost(Integer traceForestsPerHost) {
        this.traceForestsPerHost = traceForestsPerHost;
    }

    public Integer getTracePort() {
        return tracePort;
    }

    public void setTracePort(Integer tracePort) {
        this.tracePort = tracePort;
    }

    public String getTraceAuthMethod() {
        return traceAuthMethod;
    }

    public void setTraceAuthMethod(String traceAuthMethod) {
        this.traceAuthMethod = traceAuthMethod;
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

    public String getModulesDbName() {
        return modulesDbName;
    }

    public void setModulesDbName(String modulesDbName) {
        this.modulesDbName = modulesDbName;
    }

    public String getTriggersDbName() {
        return triggersDbName;
    }

    public void setTriggersDbName(String triggersDbName) {
        this.triggersDbName = triggersDbName;
    }

    public String getSchemasDbName() {
        return schemasDbName;
    }

    public void setSchemasDbName(String schemasDbName) {
        this.schemasDbName = schemasDbName;
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
    String stagingHttpName = null;
    Integer stagingForestsPerHost = null;
    Integer stagingPort = null;
    String stagingAuthMethod = null;

    String finalDbName = null;
    String finalHttpName = null;
    Integer finalForestsPerHost = null;
    Integer finalPort = null;
    String finalAuthMethod = null;

    String traceDbName = null;
    String traceHttpName = null;
    Integer traceForestsPerHost = null;
    Integer tracePort = null;
    String traceAuthMethod = null;

    String jobDbName = null;
    String jobHttpName = null;
    Integer jobForestsPerHost = null;
    Integer jobPort = null;
    String jobAuthMethod = null;

    String modulesDbName = null;
    String triggersDbName = null;
    String schemasDbName = null;

    String username = null;
    String projectDir = null;
}
