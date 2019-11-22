package com.marklogic.hub.impl;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.ConfigDir;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.ext.DatabaseClientConfig;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.error.InvalidDBOperationError;

import javax.net.ssl.SSLContext;
import javax.net.ssl.X509TrustManager;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public abstract class AbstractHubConfig extends LoggingObject implements HubConfig {

    protected AppConfig appConfig;

    protected String host = "localhost";

    protected String stagingDbName = "data-hub-STAGING";
    protected String stagingHttpName = "data-hub-STAGING";
    protected Integer stagingForestsPerHost = 3;
    protected Integer stagingPort = 8010;
    protected String stagingAuthMethod = "digest";
    protected Boolean stagingSimpleSsl;
    protected SSLContext stagingSslContext;
    protected DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier;
    protected String stagingCertFile;
    protected String stagingCertPassword;
    protected String stagingExternalName;
    protected X509TrustManager stagingTrustManager;

    protected String finalDbName = "data-hub-FINAL";
    protected String finalHttpName = "data-hub-FINAL";
    protected Integer finalForestsPerHost = 3;
    protected Integer finalPort = 8011;
    protected String finalAuthMethod = "digest";
    protected Boolean finalSimpleSsl;
    protected SSLContext finalSslContext;
    protected DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier;
    protected String finalCertFile;
    protected String finalCertPassword;
    protected String finalExternalName;
    protected X509TrustManager finalTrustManager;

    protected String jobDbName = "data-hub-JOBS";
    protected String jobHttpName = "data-hub-JOBS";
    protected Integer jobForestsPerHost = 4;
    protected Integer jobPort = 8013;
    protected String jobAuthMethod = "digest";
    protected Boolean jobSimpleSsl;
    protected SSLContext jobSslContext;
    protected DatabaseClientFactory.SSLHostnameVerifier jobSslHostnameVerifier;
    protected String jobCertFile;
    protected String jobCertPassword;
    protected String jobExternalName;
    protected X509TrustManager jobTrustManager;

    protected String modulesDbName = "data-hub-MODULES";
    protected Integer modulesForestsPerHost = 1;
    protected String stagingTriggersDbName = "data-hub-staging-TRIGGERS";
    protected Integer stagingTriggersForestsPerHost = 1;
    protected String finalTriggersDbName = "data-hub-final-TRIGGERS";
    protected Integer finalTriggersForestsPerHost = 1;
    protected String stagingSchemasDbName = "data-hub-staging-SCHEMAS";
    protected Integer stagingSchemasForestsPerHost = 1;
    protected String finalSchemasDbName = "data-hub-final-SCHEMAS";
    protected Integer finalSchemasForestsPerHost = 1;

    protected String flowOperatorRoleName = "flow-operator-role";
    protected String flowOperatorUserName = "flow-operator";
    protected String flowDeveloperRoleName = "flow-developer-role";
    protected String flowDeveloperUserName = "flow-developer";
    protected String dataHubAdminRoleName = "data-hub-admin-role";

    protected String DHFVersion;
    protected String hubLogLevel = "default";

    // these hold runtime credentials for flows.
    protected String mlUsername;
    protected String mlPassword;

    protected String loadBalancerHost;
    protected Boolean isHostLoadBalancer = false;
    protected Boolean isProvisionedEnvironment = false;
    protected String customForestPath;

    protected String modulePermissions = "rest-reader,read,rest-writer,insert,rest-writer,update,rest-extension-user,execute";
    protected String entityModelPermissions = "rest-reader,read,rest-writer,insert,rest-writer,update,data-hub-entity-model-reader,read";
    protected String jobPermissions = "data-hub-job-reader,read,data-hub-job-internal,update";

    @Override
    public DatabaseClient newAppServicesClient() {
        return getAppConfig().newAppServicesDatabaseClient(stagingDbName);
    }

    @Override
    public DatabaseClient newStagingClient() {
        return newStagingClient(stagingDbName);
    }

    public DatabaseClient newStagingClient(String dbName) {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), stagingPort, getMlUsername(), getMlPassword());
        config.setDatabase(dbName);
        config.setSecurityContextType(SecurityContextType.valueOf(stagingAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(stagingSslHostnameVerifier);
        config.setSslContext(stagingSslContext);
        config.setCertFile(stagingCertFile);
        config.setCertPassword(stagingCertPassword);
        config.setExternalName(stagingExternalName);
        config.setTrustManager(stagingTrustManager);
        if (isHostLoadBalancer) {
            config.setConnectionType(DatabaseClient.ConnectionType.GATEWAY);
        }
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    @Override
    // this method uses STAGING appserver but FINAL database.
    // it's only use is for reverse flows, which need to use staging modules.
    public DatabaseClient newReverseFlowClient() {
        return newStagingClient(finalDbName);
    }

    @Override
    public DatabaseClient newFinalClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), finalPort, getMlUsername(), getMlPassword());
        config.setDatabase(finalDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(finalAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(finalSslHostnameVerifier);
        config.setSslContext(finalSslContext);
        config.setCertFile(finalCertFile);
        config.setCertPassword(finalCertPassword);
        config.setExternalName(finalExternalName);
        config.setTrustManager(finalTrustManager);
        if (isHostLoadBalancer) {
            config.setConnectionType(DatabaseClient.ConnectionType.GATEWAY);
        }
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    public DatabaseClient newJobDbClient() {
        AppConfig appConfig = getAppConfig();
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), jobPort, mlUsername, mlPassword);
        config.setDatabase(jobDbName);
        config.setSecurityContextType(SecurityContextType.valueOf(jobAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(jobSslHostnameVerifier);
        config.setSslContext(jobSslContext);
        config.setCertFile(jobCertFile);
        config.setCertPassword(jobCertPassword);
        config.setExternalName(jobExternalName);
        config.setTrustManager(jobTrustManager);
        if (isHostLoadBalancer) {
            config.setConnectionType(DatabaseClient.ConnectionType.GATEWAY);
        }
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    public DatabaseClient newTraceDbClient() {
        return newJobDbClient();
    }

    public DatabaseClient newModulesDbClient() {
        AppConfig appConfig = getAppConfig();
        // this has to be finalPort because final is a stock REST API.
        // staging will not be; but its rewriter isn't loaded yet.
        DatabaseClientConfig config = new DatabaseClientConfig(appConfig.getHost(), finalPort, mlUsername, mlPassword);
        config.setDatabase(appConfig.getModulesDatabaseName());
        config.setSecurityContextType(SecurityContextType.valueOf(finalAuthMethod.toUpperCase()));
        config.setSslHostnameVerifier(finalSslHostnameVerifier);
        config.setSslContext(finalSslContext);
        config.setCertFile(finalCertFile);
        config.setCertPassword(finalCertPassword);
        config.setExternalName(finalExternalName);
        config.setTrustManager(finalTrustManager);
        if (isHostLoadBalancer) {
            config.setConnectionType(DatabaseClient.ConnectionType.GATEWAY);
        }
        return appConfig.getConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }

    @Override
    public String getHost() { return appConfig.getHost(); }

    @Override
    public String getDbName(DatabaseKind kind) {
        String name;
        switch (kind) {
            case STAGING:
                name = stagingDbName;
                break;
            case FINAL:
                name = finalDbName;
                break;
            case JOB:
                name = jobDbName;
                break;
            case TRACE:
                name = jobDbName;
                break;
            case MODULES:
                name = modulesDbName;
                break;
            case STAGING_MODULES:
                name = modulesDbName;
                break;
            case FINAL_MODULES:
                name = modulesDbName;
                break;
            case STAGING_TRIGGERS:
                name = stagingTriggersDbName;
                break;
            case FINAL_TRIGGERS:
                name = finalTriggersDbName;
                break;
            case STAGING_SCHEMAS:
                name = stagingSchemasDbName;
                break;
            case FINAL_SCHEMAS:
                name = finalSchemasDbName;
                break;
            default:
                throw new InvalidDBOperationError(kind, "grab database name");
        }
        return name;
    }

    @Override
    public void setDbName(DatabaseKind kind, String dbName) {
        switch (kind) {
            case STAGING:
                stagingDbName = dbName;
                break;
            case FINAL:
                finalDbName = dbName;
                break;
            case JOB:
                jobDbName = dbName;
                break;
            case TRACE:
                jobDbName = dbName;
                break;
            case MODULES:
                modulesDbName = dbName;
                break;
            case STAGING_MODULES:
                modulesDbName = dbName;
                break;
            case FINAL_MODULES:
                modulesDbName = dbName;
                break;
            case STAGING_TRIGGERS:
                stagingTriggersDbName = dbName;
                break;
            case FINAL_TRIGGERS:
                finalTriggersDbName = dbName;
                break;
            case STAGING_SCHEMAS:
                stagingSchemasDbName = dbName;
                break;
            case FINAL_SCHEMAS:
                finalSchemasDbName = dbName;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set database name");
        }
    }

    @Override
    public String getHttpName(DatabaseKind kind) {
        String name;
        switch (kind) {
            case STAGING:
                name = stagingHttpName;
                break;
            case FINAL:
                name = finalHttpName;
                break;
            case JOB:
                name = jobHttpName;
                break;
            case TRACE:
                name = jobHttpName;
                break;
            default:
                throw new InvalidDBOperationError(kind, "grab http name");
        }
        return name;
    }

    @Override
    public void setHttpName(DatabaseKind kind, String httpName) {
        switch (kind) {
            case STAGING:
                stagingHttpName = httpName;
                break;
            case FINAL:
                finalHttpName = httpName;
                break;
            case JOB:
                jobHttpName = httpName;
                break;
            case TRACE:
                jobHttpName = httpName;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set http name");
        }
    }

    @Override
    public Integer getForestsPerHost(DatabaseKind kind) {
        Integer forests;
        switch (kind) {
            case STAGING:
                forests = stagingForestsPerHost;
                break;
            case FINAL:
                forests = finalForestsPerHost;
                break;
            case JOB:
                forests = jobForestsPerHost;
                break;
            case TRACE:
                forests = jobForestsPerHost;
                break;
            case MODULES:
                forests = modulesForestsPerHost;
                break;
            case STAGING_MODULES:
                forests = modulesForestsPerHost;
                break;
            case FINAL_MODULES:
                forests = modulesForestsPerHost;
                break;
            case STAGING_TRIGGERS:
                forests = stagingTriggersForestsPerHost;
                break;
            case FINAL_TRIGGERS:
                forests = finalTriggersForestsPerHost;
                break;
            case STAGING_SCHEMAS:
                forests = stagingSchemasForestsPerHost;
                break;
            case FINAL_SCHEMAS:
                forests = finalSchemasForestsPerHost;
                break;
            default:
                throw new InvalidDBOperationError(kind, "grab count of forests per host");
        }
        return forests;
    }

    @Override
    public void setForestsPerHost(DatabaseKind kind, Integer forestsPerHost) {
        switch (kind) {
            case STAGING:
                stagingForestsPerHost = forestsPerHost;
                break;
            case FINAL:
                finalForestsPerHost = forestsPerHost;
                break;
            case JOB:
                jobForestsPerHost = forestsPerHost;
                break;
            case TRACE:
                jobForestsPerHost = forestsPerHost;
                break;
            case MODULES:
                modulesForestsPerHost = forestsPerHost;
                break;
            case STAGING_MODULES:
                modulesForestsPerHost = forestsPerHost;
                break;
            case FINAL_MODULES:
                modulesForestsPerHost = forestsPerHost;
                break;
            case STAGING_TRIGGERS:
                stagingTriggersForestsPerHost = forestsPerHost;
                break;
            case FINAL_TRIGGERS:
                finalTriggersForestsPerHost = forestsPerHost;
                break;
            case STAGING_SCHEMAS:
                stagingSchemasForestsPerHost = forestsPerHost;
                break;
            case FINAL_SCHEMAS:
                finalSchemasForestsPerHost = forestsPerHost;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set count of forests per host");
        }
    }

    @Override
    public Integer getPort(DatabaseKind kind) {
        Integer port;
        switch (kind) {
            case STAGING:
                port = stagingPort;
                break;
            case FINAL:
                port = finalPort;
                break;
            case JOB:
                port = jobPort;
                break;
            case TRACE:
                port = jobPort;
                break;
            default:
                throw new InvalidDBOperationError(kind, "grab app port");
        }
        return port;
    }

    @Override
    public void setPort(DatabaseKind kind, Integer port) {
        switch (kind) {
            case STAGING:
                stagingPort = port;
                break;
            case FINAL:
                finalPort = port;
                break;
            case JOB:
                jobPort = port;
                break;
            case TRACE:
                jobPort = port;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set app port");
        }
    }


    @Override
    public SSLContext getSslContext(DatabaseKind kind) {
        SSLContext sslContext;
        switch (kind) {
            case STAGING:
                sslContext = this.stagingSslContext;
                break;
            case JOB:
                sslContext = this.jobSslContext;
                break;
            case TRACE:
                sslContext = this.jobSslContext;
                break;
            case FINAL:
                sslContext = this.finalSslContext;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get ssl context");
        }
        return sslContext;
    }

    @Override
    public void setSslContext(DatabaseKind kind, SSLContext sslContext) {
        switch (kind) {
            case STAGING:
                this.stagingSslContext = sslContext;
                break;
            case JOB:
                this.jobSslContext = sslContext;
                break;
            case TRACE:
                this.jobSslContext = sslContext;
                break;
            case FINAL:
                this.finalSslContext = sslContext;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set ssl context");
        }
    }

    @Override
    public DatabaseClientFactory.SSLHostnameVerifier getSslHostnameVerifier(DatabaseKind kind) {
        DatabaseClientFactory.SSLHostnameVerifier sslHostnameVerifier;
        switch (kind) {
            case STAGING:
                sslHostnameVerifier = this.stagingSslHostnameVerifier;
                break;
            case JOB:
                sslHostnameVerifier = this.jobSslHostnameVerifier;
                break;
            case TRACE:
                sslHostnameVerifier = this.jobSslHostnameVerifier;
                break;
            case FINAL:
                sslHostnameVerifier = this.finalSslHostnameVerifier;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get ssl hostname verifier");
        }
        return sslHostnameVerifier;
    }

    @Override
    public void setSslHostnameVerifier(DatabaseKind kind, DatabaseClientFactory.SSLHostnameVerifier sslHostnameVerifier) {
        switch (kind) {
            case STAGING:
                this.stagingSslHostnameVerifier = sslHostnameVerifier;
                break;
            case JOB:
                this.jobSslHostnameVerifier = sslHostnameVerifier;
                break;
            case TRACE:
                this.jobSslHostnameVerifier = sslHostnameVerifier;
                break;
            case FINAL:
                this.finalSslHostnameVerifier = sslHostnameVerifier;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set ssl hostname verifier");
        }
    }

    @Override
    public String getAuthMethod(DatabaseKind kind) {
        String authMethod;
        switch (kind) {
            case STAGING:
                authMethod = this.stagingAuthMethod;
                break;
            case FINAL:
                authMethod = this.finalAuthMethod;
                break;
            case JOB:
                authMethod = this.jobAuthMethod;
                break;
            case TRACE:
                authMethod = this.jobAuthMethod;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get auth method");
        }
        return authMethod;
    }

    @Override
    public void setAuthMethod(DatabaseKind kind, String authMethod) {
        switch (kind) {
            case STAGING:
                this.stagingAuthMethod = authMethod;
                break;
            case FINAL:
                this.finalAuthMethod = authMethod;
                break;
            case JOB:
                this.jobAuthMethod = authMethod;
                break;
            case TRACE:
                this.jobAuthMethod = authMethod;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set auth method");
        }
    }

    public X509TrustManager getTrustManager(DatabaseKind kind) {
        switch (kind) {
            case STAGING:
                return this.stagingTrustManager;
            case JOB:
                return this.jobTrustManager;
            case FINAL:
                return this.finalTrustManager;
            default:
                throw new InvalidDBOperationError(kind, "set auth method");
        }
    }

    @Override
    public void setTrustManager(DatabaseKind kind, X509TrustManager trustManager) {
        switch (kind) {
            case STAGING:
                this.stagingTrustManager = trustManager;
                break;
            case JOB:
                this.jobTrustManager = trustManager;
                break;
            case FINAL:
                this.finalTrustManager = trustManager;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set auth method");
        }
    }

    @Deprecated
    @Override
    public String getScheme(DatabaseKind kind) {
        return null;
    }

    @Deprecated
    @Override
    public void setScheme(DatabaseKind kind, String scheme) {
    }

    @Override
    public boolean getSimpleSsl(DatabaseKind kind) {
        boolean simple;
        switch (kind) {
            case STAGING:
                simple = this.stagingSimpleSsl;
                break;
            case JOB:
                simple = this.jobSimpleSsl;
                break;
            case TRACE:
                simple = this.jobSimpleSsl;
                break;
            case FINAL:
                simple = this.finalSimpleSsl;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get simple ssl");
        }
        return simple;
    }

    @Override
    public void setSimpleSsl(DatabaseKind kind, Boolean simpleSsl) {
        switch (kind) {
            case STAGING:
                this.stagingSimpleSsl = simpleSsl;
                break;
            case JOB:
                this.jobSimpleSsl = simpleSsl;
                break;
            case TRACE:
                this.jobSimpleSsl = simpleSsl;
                break;
            case FINAL:
                this.finalSimpleSsl = simpleSsl;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set simple ssl");
        }
    }

    @Override
    public String getCertFile(DatabaseKind kind) {
        String certFile;
        switch (kind) {
            case STAGING:
                certFile = this.stagingCertFile;
                break;
            case JOB:
                certFile = this.jobCertFile;
                break;
            case TRACE:
                certFile = this.jobCertFile;
                break;
            case FINAL:
                certFile = this.finalCertFile;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get cert file");
        }
        return certFile;
    }

    @Override
    public void setCertFile(DatabaseKind kind, String certFile) {
        switch (kind) {
            case STAGING:
                this.stagingCertFile = certFile;
                break;
            case JOB:
                this.jobCertFile = certFile;
                break;
            case TRACE:
                this.jobCertFile = certFile;
                break;
            case FINAL:
                this.finalCertFile = certFile;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set certificate file");
        }
    }

    @Override
    public String getCertPassword(DatabaseKind kind) {
        String certPass;
        switch (kind) {
            case STAGING:
                certPass = this.stagingCertPassword;
                break;
            case JOB:
                certPass = this.jobCertPassword;
                break;
            case TRACE:
                certPass = this.jobCertPassword;
                break;
            case FINAL:
                certPass = this.finalCertPassword;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get cert password");
        }
        return certPass;
    }

    @Override
    public void setCertPass(DatabaseKind kind, String certPassword) {
        switch (kind) {
            case STAGING:
                this.stagingCertPassword = certPassword;
                break;
            case JOB:
                this.jobCertPassword = certPassword;
                break;
            case TRACE:
                this.jobCertPassword = certPassword;
                break;
            case FINAL:
                this.finalCertPassword = certPassword;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set certificate password");
        }
    }

    @Override
    public String getExternalName(DatabaseKind kind) {
        String name;
        switch (kind) {
            case STAGING:
                name = this.stagingExternalName;
                break;
            case JOB:
                name = this.jobExternalName;
                break;
            case TRACE:
                name = this.jobExternalName;
                break;
            case FINAL:
                name = this.finalExternalName;
                break;
            default:
                throw new InvalidDBOperationError(kind, "get external name");
        }
        return name;
    }

    @Override
    public void setExternalName(DatabaseKind kind, String externalName) {
        switch (kind) {
            case STAGING:
                this.stagingExternalName = externalName;
                break;
            case JOB:
                this.jobExternalName = externalName;
                break;
            case TRACE:
                this.jobExternalName = externalName;
                break;
            case FINAL:
                this.finalExternalName = externalName;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set auth method");
        }
    }

    @Override
    public String getFlowOperatorRoleName() {
        return flowOperatorRoleName;
    }

    @Override
    public void setFlowOperatorRoleName(String flowOperatorRoleName) {
        this.flowOperatorRoleName = flowOperatorRoleName;
    }

    @Override
    public String getFlowOperatorUserName() {
        return flowOperatorUserName;
    }

    @Override
    public void setFlowOperatorUserName(String flowOperatorUserName) {
        this.flowOperatorUserName = flowOperatorUserName;
    }

    @Override
    public String getFlowDeveloperRoleName() {
        return flowDeveloperRoleName;
    }

    @Override
    public void setFlowDeveloperRoleName(String flowDeveloperRoleName) {
        this.flowDeveloperRoleName = flowDeveloperRoleName;
    }

    @Override
    public String getFlowDeveloperUserName() {
        return flowDeveloperUserName;
    }

    @Override
    public void setFlowDeveloperUserName(String flowDeveloperUserName) {
        this.flowDeveloperUserName = flowDeveloperUserName;
    }

    @Override
    public String getMlUsername() {
        return mlUsername;
    }

    @Override
    public String getMlPassword() {
        return mlPassword;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public void setMlUsername(String mlUsername) {
        this.mlUsername = mlUsername;
    }

    public void setMlPassword(String mlPassword) {
        this.mlPassword = mlPassword;
    }

    @JsonIgnore
    @Override
    public String getLoadBalancerHost() {
        return loadBalancerHost;
    }

    @Override
    public Boolean getIsHostLoadBalancer() {
        return isHostLoadBalancer;
    }

    @Override
    public Boolean getIsProvisionedEnvironment() {
        return isProvisionedEnvironment;
    }

    public void setLoadBalancerHost(String loadBalancerHost) {
        this.loadBalancerHost = loadBalancerHost;
    }

    @Override
    public String getCustomForestPath() {
        return customForestPath;
    }

    public void setCustomForestPath(String customForestPath) {
        this.customForestPath = customForestPath;
    }

    @Override
    public String getModulePermissions() {
        return modulePermissions;
    }

    public void setModulePermissions(String modulePermissions) {
        this.modulePermissions = modulePermissions;
    }

    @Override
    public String getEntityModelPermissions() {
        return entityModelPermissions;
    }

    public void setEntityModelPermissions(String entityModelPermissions) {
        this.entityModelPermissions = entityModelPermissions;
    }

    public String getJobPermissions() {
        return jobPermissions;
    }

    public void setJobPermissions(String jobPermissions) {
        this.jobPermissions = jobPermissions;
    }

    @JsonIgnore
    @Override
    public AppConfig getAppConfig() {
        return appConfig;
    }

    @Override
    public void setAppConfig(AppConfig config) {
        this.appConfig = config;
    }

    @Override
    public void setAppConfig(AppConfig config, boolean skipUpdate) {
        this.appConfig = config;
    }

    @Override
    public String getJarVersion() {
        Properties properties = new Properties();
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream("version.properties")) {
            properties.load(inputStream);
        } catch (IOException e) {
            throw new RuntimeException("Unable to read version.properties from classpath, cause: " + e.getMessage(), e);
        }

        String version = (String)properties.get("version");
        // this lets debug builds work from an IDE
        if (version.equals("${project.version}")) {
            version = "5.2-SNAPSHOT";
        }
        return version;
    }

    @Override
    public String getDHFVersion() {
        return this.DHFVersion;
    }

    @Override
    public String getHubLogLevel() {
        return this.hubLogLevel;
    }

    public String getStagingSchemasDbName() {
        return this.stagingSchemasDbName;
    }

    public String getStagingTriggersDbName() {
        return this.stagingTriggersDbName;
    }

    /**
     * Makes DHF-specific updates to the AppConfig, after it's been constructed by ml-gradle.
     *
     * @param config
     */
    protected void updateAppConfig(AppConfig config) {
        // If the user hasn't set the app name then override it to "DHF" instead of "my-app"
        if ("my-app".equals(config.getName())) {
            config.setName("DHF");
        }

        // DHF never needs the default REST server provided by ml-gradle
        config.setNoRestServer(true);

        applyFinalConnectionSettingsToMlGradleDefaultRestSettings(config);

        config.setTriggersDatabaseName(finalTriggersDbName);
        config.setSchemasDatabaseName(finalSchemasDbName);
        config.setModulesDatabaseName(modulesDbName);
        config.setContentDatabaseName(finalDbName);

        config.setReplaceTokensInModules(true);
        config.setUseRoxyTokenPrefix(false);
        config.setModulePermissions(modulePermissions);

        Map<String, Integer> forestCounts = config.getForestCounts();
        forestCounts.put(jobDbName, jobForestsPerHost);
        forestCounts.put(modulesDbName, modulesForestsPerHost);
        forestCounts.put(stagingDbName, stagingForestsPerHost);
        forestCounts.put(stagingTriggersDbName, stagingTriggersForestsPerHost);
        forestCounts.put(stagingSchemasDbName, stagingSchemasForestsPerHost);
        forestCounts.put(finalDbName, finalForestsPerHost);
        forestCounts.put(finalTriggersDbName, finalTriggersForestsPerHost);
        forestCounts.put(finalSchemasDbName, finalSchemasForestsPerHost);
        config.setForestCounts(forestCounts);

        initializeConfigDirs(config);

        initializeModulePaths(config);

        config.setSchemasPath(getUserSchemasDir().toString());

        String version = getJarVersion();
        config.getCustomTokens().put("%%mlHubVersion%%", version);

        this.appConfig = config;
    }

    /**
     * ml-app-deployer defaults to a single config path of src/main/ml-config. If that's still the only path present,
     * it's overridden with the DHF defaults - src/main/hub-internal-config first, then src/main/ml-config second, with
     * both of those being relative to the DHF project directory.
     *
     * But if the config paths have been customized - most likely via mlConfigPaths in gradle.properties - then this
     * method just ensures that they're relative to the DHF project directory.
     *
     * @param config an AppConfig object
     */
    protected void initializeConfigDirs(AppConfig config) {
        final String defaultConfigPath = String.join(File.separator, "src", "main", "ml-config");

        boolean configDirsIsSetToTheMlAppDeployerDefault = config.getConfigDirs().size() == 1 && config.getConfigDirs().get(0).getBaseDir().toString().endsWith(defaultConfigPath);

        if (configDirsIsSetToTheMlAppDeployerDefault) {
            List<ConfigDir> configDirs = new ArrayList<>();
            configDirs.add(new ConfigDir(getHubConfigDir().toFile()));
            configDirs.add(new ConfigDir(getUserConfigDir().toFile()));
            config.setConfigDirs(configDirs);
        }
        else {
            // Need to make each custom config dir relative to the project dir
            List<ConfigDir> configDirs = new ArrayList<>();
            for (ConfigDir configDir : config.getConfigDirs()) {
                File f = getHubProject().getProjectDir().resolve(configDir.getBaseDir().toString()).normalize().toAbsolutePath().toFile();
                configDirs.add(new ConfigDir(f));
            }
            config.setConfigDirs(configDirs);
        }

        if (logger.isInfoEnabled()) {
            config.getConfigDirs().forEach(configDir -> logger.info("Config path: " + configDir.getBaseDir().getAbsolutePath()));
        }
    }

    /**
     * Need to initialize every module path as being relative to the current project directory.
     *
     * @param config an AppConfig object
     */
    protected void initializeModulePaths(AppConfig config) {
        List<String> modulePaths = new ArrayList<>();
        Path projectDir = getHubProject().getProjectDir();
        for (String modulePath : config.getModulePaths()) {
            modulePaths.add(projectDir.resolve(modulePath).normalize().toAbsolutePath().toString());
        }
        config.setModulePaths(modulePaths);
        if (logger.isInfoEnabled()) {
            logger.info("Module paths: " + modulePaths);
        }
    }

    /**
     * This is needed so that mlFinal* properties that configure the connection to the final REST server are also used
     * for any feature in ml-gradle that expects to use the same mlRest* properties. For example, LoadModulesCommand
     * uses those properties to construct a DatabaseClient for loading modules; we want to ensure that the properties
     * mirror the mlFinal* properties.
     *
     * @param config
     */
    private void applyFinalConnectionSettingsToMlGradleDefaultRestSettings(AppConfig config) {
        if (finalAuthMethod != null) {
            config.setRestSecurityContextType(SecurityContextType.valueOf(finalAuthMethod.toUpperCase()));
        }
        config.setRestPort(finalPort);
        config.setRestCertFile(finalCertFile);
        config.setRestCertPassword(finalCertPassword);
        config.setRestExternalName(finalExternalName);
        config.setRestSslContext(finalSslContext);
        config.setRestSslHostnameVerifier(finalSslHostnameVerifier);
        config.setRestTrustManager(finalTrustManager);
    }

    @JsonIgnore
    public String getInfo()
    {
        try {
            return new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(this);
        }
        catch(Exception e)
        {
            throw new DataHubConfigurationException("Your datahub configuration could not serialize", e);
        }
    }

    @Override
    public String toString() {
        return getInfo();
    }

}
