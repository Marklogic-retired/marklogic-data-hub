package com.marklogic.hub;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.ext.ConfiguredDatabaseClientFactory;
import com.marklogic.client.ext.DatabaseClientConfig;
import com.marklogic.client.ext.DefaultConfiguredDatabaseClientFactory;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager;
import com.marklogic.mgmt.DefaultManageConfigFactory;
import com.marklogic.mgmt.ManageConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.SSLContext;
import javax.net.ssl.X509TrustManager;
import java.util.*;
import java.util.function.Consumer;
import java.util.function.Function;

/**
 * Defines all of the Data Hub properties requires to construct a HubClient.
 * <p>
 * This class was extracted from the HubConfigImpl class, which was expected in some places of DHF to be serialized
 * to JSON and then deserialized back. To maintain the serialization behavior, this class uses JsonIgnore annotations
 * to prevent certain public getters from being serialized. It also applies the standard behavior of making fields
 * private, and thus HubConfigImpl's Jackson configuration for accessing protected fields will not apply here.
 * Private fields are instead exposed via public getters that are not JsonIgnore'd, which is a much more typical way
 * of controlling access to data and controlling what is serialized.
 * </p>
 */
public class HubClientConfig {

    private ConfiguredDatabaseClientFactory configuredDatabaseClientFactory = new DefaultConfiguredDatabaseClientFactory();
    private static final Logger logger = LoggerFactory.getLogger(HubClientConfig.class);

    private String host;
    private String username;
    private String password;

    private String stagingDbName;
    private Integer stagingPort;
    private String stagingAuthMethod;
    private Boolean stagingSimpleSsl;
    private SSLContext stagingSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier;
    private String stagingCertFile;
    private String stagingCertPassword;
    private String stagingExternalName;
    private X509TrustManager stagingTrustManager;

    private String finalDbName;
    private Integer finalPort;
    private String finalAuthMethod;
    private Boolean finalSimpleSsl;
    private SSLContext finalSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier;
    private String finalCertFile;
    private String finalCertPassword;
    private String finalExternalName;
    private X509TrustManager finalTrustManager;

    private String jobDbName;
    private Integer jobPort;
    private String jobAuthMethod;
    private Boolean jobSimpleSsl;
    private SSLContext jobSslContext;
    private DatabaseClientFactory.SSLHostnameVerifier jobSslHostnameVerifier;
    private String jobCertFile;
    private String jobCertPassword;
    private String jobExternalName;
    private X509TrustManager jobTrustManager;

    private String modulesDbName;
    private String stagingTriggersDbName;
    private String finalTriggersDbName;
    private String stagingSchemasDbName;
    private String finalSchemasDbName;

    // This is captured here as it's valid for a client to want to insert modules and be able to reuse the default permissions.
    // The other permission properties from HubConfigImpl are not yet being stored here because it's preferred to use
    // DHF DS endpoints to load artifacts, and those endpoints know the permissions to use.
    private String modulePermissions;

    private Boolean isHostLoadBalancer;

    private ManageConfig manageConfig;

    // Defines functions for consuming properties from a PropertySource
    private Map<String, Consumer<String>> propertyConsumerMap;

    public HubClientConfig() {
        applyDefaultPropertyValues();
    }

    public HubClientConfig(Properties props) {
        this();
        applyProperties(props);
    }

    public void applyProperties(Properties properties) {
        applyProperties(propertyName -> properties.getProperty(propertyName), null);
    }

    /**
     * @param propertySource
     * @param manageConfigToReuse allows the caller to provide a ManageConfig to reuse, instead of instantiating a new
     *                            one based on the given propertySource
     */
    public void applyProperties(Function<String, String> propertySource, ManageConfig manageConfigToReuse) {
        // Configure manageConfig based on ml-app-deployer properties first
        // DHF properties may then make further modifications to it
        if (manageConfigToReuse != null) {
            this.manageConfig = manageConfigToReuse;
        } else {
            this.manageConfig = new DefaultManageConfigFactory(propertyName -> propertySource.apply(propertyName)).newManageConfig();
        }

        if (propertyConsumerMap == null) {
            initializePropertyConsumerMap();
        }
        for (String propertyName : propertyConsumerMap.keySet()) {
            String value = propertySource.apply(propertyName);
            if (value != null) {
                propertyConsumerMap.get(propertyName).accept(value);
            }
        }
        instantiateSslObjects();
    }

    /**
     * Allows for subclasses to add their own consumers.
     *
     * @return
     */
    @JsonIgnore
    protected Map<String, Consumer<String>> getPropertyConsumerMap() {
        return propertyConsumerMap;
    }

    /**
     * For clients - such as the Spark connector - that must deal with only lowercase property names, this method
     * can be called to register every property consumer under the lowercased version of its property name.
     */
    public void registerLowerCasedPropertyConsumers() {
        if (propertyConsumerMap == null) {
            initializePropertyConsumerMap();
        }
        Set<String> propertyNames = new HashSet<>(propertyConsumerMap.keySet());
        propertyNames.forEach(propertyName -> propertyConsumerMap.put(propertyName.toLowerCase(), propertyConsumerMap.get(propertyName)));
    }

    public DatabaseClient newStagingClient(String dbName) {
        DatabaseClientConfig config = new DatabaseClientConfig(host, stagingPort, username, password);
        if (dbName != null) {
            config.setDatabase(dbName);
        }
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
        return configuredDatabaseClientFactory.newDatabaseClient(config);
    }

    public DatabaseClient newFinalClient(String dbName) {
        DatabaseClientConfig config = new DatabaseClientConfig(host, finalPort, username, password);
        if (dbName != null) {
            config.setDatabase(dbName);
        }
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
        return configuredDatabaseClientFactory.newDatabaseClient(config);
    }

    public DatabaseClient newJobDbClient() {
        DatabaseClientConfig config = new DatabaseClientConfig(host, jobPort, username, password);
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
        return configuredDatabaseClientFactory.newDatabaseClient(config);
    }

    public DatabaseClient newModulesDbClient() {
        // Uses the final app server, which is known to use the OOTB REST rewriter, and staging does not
        return newFinalClient(modulesDbName);
    }

    @JsonIgnore
    public Map<DatabaseKind, String> getDatabaseNames() {
        Map<DatabaseKind, String> databaseNames = new HashMap<>();
        databaseNames.put(DatabaseKind.STAGING, getStagingDbName());
        databaseNames.put(DatabaseKind.FINAL, getFinalDbName());
        databaseNames.put(DatabaseKind.JOB, getJobDbName());
        databaseNames.put(DatabaseKind.MODULES, getModulesDbName());
        databaseNames.put(DatabaseKind.STAGING_TRIGGERS, getStagingTriggersDbName());
        databaseNames.put(DatabaseKind.STAGING_SCHEMAS, getStagingSchemasDbName());
        databaseNames.put(DatabaseKind.FINAL_TRIGGERS, getFinalTriggersDbName());
        databaseNames.put(DatabaseKind.FINAL_SCHEMAS, getFinalSchemasDbName());
        return databaseNames;
    }

    public void applyDefaultPropertyValues() {
        host = "localhost";
        isHostLoadBalancer = false;
        manageConfig = null;

        stagingDbName = "data-hub-STAGING";
        stagingPort = 8010;
        stagingAuthMethod = "digest";
        stagingSimpleSsl = false;
        stagingSslContext = null;
        stagingSslHostnameVerifier = null;
        stagingCertFile = null;
        stagingCertPassword = null;
        stagingExternalName = null;
        stagingTrustManager = null;

        finalDbName = "data-hub-FINAL";
        finalPort = 8011;
        finalAuthMethod = "digest";
        finalSimpleSsl = false;
        finalSslContext = null;
        finalSslHostnameVerifier = null;
        finalCertFile = null;
        finalCertPassword = null;
        finalExternalName = null;
        finalTrustManager = null;

        jobDbName = "data-hub-JOBS";
        jobPort = 8013;
        jobAuthMethod = "digest";
        jobSimpleSsl = false;
        jobSslContext = null;
        jobSslHostnameVerifier = null;
        jobCertFile = null;
        jobCertPassword = null;
        jobExternalName = null;
        jobTrustManager = null;

        modulesDbName = "data-hub-MODULES";
        stagingTriggersDbName = "data-hub-staging-TRIGGERS";
        finalTriggersDbName = "data-hub-final-TRIGGERS";
        stagingSchemasDbName = "data-hub-staging-SCHEMAS";
        finalSchemasDbName = "data-hub-final-SCHEMAS";

        modulePermissions = "data-hub-module-reader,read,data-hub-module-reader,execute,data-hub-module-writer,update,rest-extension-user,execute";
    }

    public void configureForDhs() {
        isHostLoadBalancer = true;
        finalAuthMethod = "basic";
        stagingAuthMethod = "basic";
        jobAuthMethod = "basic";
        // A connection to DHS may be from behind the load balancer and thus does not require SSL
        // If SSL is needed, use configureSimpleSsl
        manageConfig.setScheme("http");
        manageConfig.setConfigureSimpleSsl(false);
    }

    public void configureSimpleSsl() {
        finalSimpleSsl = true;
        stagingSimpleSsl = true;
        jobSimpleSsl = true;
        manageConfig.setScheme("https");
        manageConfig.setConfigureSimpleSsl(true);
    }

    /**
     * Defines functions for consuming properties from a PropertySource. This differs substantially from
     * loadConfigurationFromProperties, as that function's behavior depends on whether a field has a value or not.
     */
    protected void initializePropertyConsumerMap() {
        propertyConsumerMap = new LinkedHashMap<>();

        // These "convenience" properties set applied first so that the property values can still be overridden via the
        // property keys specific to them
        propertyConsumerMap.put("hubDhs", prop -> {
            if (Boolean.parseBoolean(prop)) {
                configureForDhs();
            }
        });

        propertyConsumerMap.put("hubSsl", prop -> {
            if (Boolean.parseBoolean(prop)) {
                configureSimpleSsl();
            }
        });

        propertyConsumerMap.put("mlUsername", prop -> username = prop);
        propertyConsumerMap.put("mlPassword", prop -> password = prop);

        propertyConsumerMap.put("mlDHFVersion", prop -> logger.warn("mlDHFVersion no longer has any impact " +
            "starting in version 5.3.0. You may safely remove this from your properties file."));

        propertyConsumerMap.put("mlHost", prop -> host = prop);
        propertyConsumerMap.put("mlIsHostLoadBalancer", prop -> isHostLoadBalancer = Boolean.parseBoolean(prop));
        propertyConsumerMap.put("mlLoadBalancerHosts", prop ->
            logger.warn("mlLoadBalancerHosts was deprecated in version 4.0.1 and does not have any impact on Data Hub functionality. " +
                "It can be safely removed from your set of properties."));

        propertyConsumerMap.put("mlStagingDbName", prop -> stagingDbName = prop);
        propertyConsumerMap.put("mlStagingPort", prop -> stagingPort = Integer.parseInt(prop));
        propertyConsumerMap.put("mlStagingAuth", prop -> stagingAuthMethod = prop);
        propertyConsumerMap.put("mlStagingSimpleSsl", prop -> stagingSimpleSsl = Boolean.parseBoolean(prop));
        propertyConsumerMap.put("mlStagingCertFile", prop -> stagingCertFile = prop);
        propertyConsumerMap.put("mlStagingCertPassword", prop -> stagingCertPassword = prop);
        propertyConsumerMap.put("mlStagingExternalName", prop -> stagingExternalName = prop);

        propertyConsumerMap.put("mlFinalDbName", prop -> finalDbName = prop);
        propertyConsumerMap.put("mlFinalPort", prop -> finalPort = Integer.parseInt(prop));
        propertyConsumerMap.put("mlFinalAuth", prop -> finalAuthMethod = prop);
        propertyConsumerMap.put("mlFinalSimpleSsl", prop -> finalSimpleSsl = Boolean.parseBoolean(prop));
        propertyConsumerMap.put("mlFinalCertFile", prop -> finalCertFile = prop);
        propertyConsumerMap.put("mlFinalCertPassword", prop -> finalCertPassword = prop);
        propertyConsumerMap.put("mlFinalExternalName", prop -> finalExternalName = prop);

        propertyConsumerMap.put("mlJobDbName", prop -> jobDbName = prop);
        propertyConsumerMap.put("mlJobPort", prop -> jobPort = Integer.parseInt(prop));
        propertyConsumerMap.put("mlJobAuth", prop -> jobAuthMethod = prop);
        propertyConsumerMap.put("mlJobSimpleSsl", prop -> jobSimpleSsl = Boolean.parseBoolean(prop));
        propertyConsumerMap.put("mlJobCertFile", prop -> jobCertFile = prop);
        propertyConsumerMap.put("mlJobCertPassword", prop -> jobCertPassword = prop);
        propertyConsumerMap.put("mlJobExternalName", prop -> jobExternalName = prop);

        propertyConsumerMap.put("mlModulesDbName", prop -> modulesDbName = prop);
        propertyConsumerMap.put("mlStagingTriggersDbName", prop -> stagingTriggersDbName = prop);
        propertyConsumerMap.put("mlStagingSchemasDbName", prop -> stagingSchemasDbName = prop);
        propertyConsumerMap.put("mlFinalTriggersDbName", prop -> finalTriggersDbName = prop);
        propertyConsumerMap.put("mlFinalSchemasDbName", prop -> finalSchemasDbName = prop);

        propertyConsumerMap.put("mlModulePermissions", prop -> modulePermissions = prop);
    }

    /**
     * After setting properties, this method must be invoked to instantiate SSL objects in case any of the SSL-related
     * properties have been set to true.
     */
    private void instantiateSslObjects() {
        if (stagingSimpleSsl != null && stagingSimpleSsl) {
            stagingSslContext = SimpleX509TrustManager.newSSLContext();
            stagingSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            stagingTrustManager = new SimpleX509TrustManager();
        }
        if (finalSimpleSsl != null && finalSimpleSsl) {
            finalSslContext = SimpleX509TrustManager.newSSLContext();
            finalSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            finalTrustManager = new SimpleX509TrustManager();
        }
        if (jobSimpleSsl != null && jobSimpleSsl) {
            jobSslContext = SimpleX509TrustManager.newSSLContext();
            jobSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
            jobTrustManager = new SimpleX509TrustManager();
        }
    }

    public void setConfiguredDatabaseClientFactory(ConfiguredDatabaseClientFactory configuredDatabaseClientFactory) {
        this.configuredDatabaseClientFactory = configuredDatabaseClientFactory;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @JsonIgnore
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public Boolean getStagingSimpleSsl() {
        return stagingSimpleSsl;
    }

    public void setStagingSimpleSsl(Boolean stagingSimpleSsl) {
        this.stagingSimpleSsl = stagingSimpleSsl;
    }

    @JsonIgnore
    public SSLContext getStagingSslContext() {
        return stagingSslContext;
    }

    public void setStagingSslContext(SSLContext stagingSslContext) {
        this.stagingSslContext = stagingSslContext;
    }

    @JsonIgnore
    public DatabaseClientFactory.SSLHostnameVerifier getStagingSslHostnameVerifier() {
        return stagingSslHostnameVerifier;
    }

    public void setStagingSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier) {
        this.stagingSslHostnameVerifier = stagingSslHostnameVerifier;
    }

    public String getStagingCertFile() {
        return stagingCertFile;
    }

    public void setStagingCertFile(String stagingCertFile) {
        this.stagingCertFile = stagingCertFile;
    }

    @JsonIgnore
    public String getStagingCertPassword() {
        return stagingCertPassword;
    }

    public void setStagingCertPassword(String stagingCertPassword) {
        this.stagingCertPassword = stagingCertPassword;
    }

    public String getStagingExternalName() {
        return stagingExternalName;
    }

    public void setStagingExternalName(String stagingExternalName) {
        this.stagingExternalName = stagingExternalName;
    }

    @JsonIgnore
    public X509TrustManager getStagingTrustManager() {
        return stagingTrustManager;
    }

    public void setStagingTrustManager(X509TrustManager stagingTrustManager) {
        this.stagingTrustManager = stagingTrustManager;
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

    public Boolean getFinalSimpleSsl() {
        return finalSimpleSsl;
    }

    public void setFinalSimpleSsl(Boolean finalSimpleSsl) {
        this.finalSimpleSsl = finalSimpleSsl;
    }

    @JsonIgnore
    public SSLContext getFinalSslContext() {
        return finalSslContext;
    }

    public void setFinalSslContext(SSLContext finalSslContext) {
        this.finalSslContext = finalSslContext;
    }

    @JsonIgnore
    public DatabaseClientFactory.SSLHostnameVerifier getFinalSslHostnameVerifier() {
        return finalSslHostnameVerifier;
    }

    public void setFinalSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier) {
        this.finalSslHostnameVerifier = finalSslHostnameVerifier;
    }

    public String getFinalCertFile() {
        return finalCertFile;
    }

    public void setFinalCertFile(String finalCertFile) {
        this.finalCertFile = finalCertFile;
    }

    @JsonIgnore
    public String getFinalCertPassword() {
        return finalCertPassword;
    }

    public void setFinalCertPassword(String finalCertPassword) {
        this.finalCertPassword = finalCertPassword;
    }

    public String getFinalExternalName() {
        return finalExternalName;
    }

    public void setFinalExternalName(String finalExternalName) {
        this.finalExternalName = finalExternalName;
    }

    @JsonIgnore
    public X509TrustManager getFinalTrustManager() {
        return finalTrustManager;
    }

    public void setFinalTrustManager(X509TrustManager finalTrustManager) {
        this.finalTrustManager = finalTrustManager;
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

    public Boolean getJobSimpleSsl() {
        return jobSimpleSsl;
    }

    public void setJobSimpleSsl(Boolean jobSimpleSsl) {
        this.jobSimpleSsl = jobSimpleSsl;
    }

    @JsonIgnore
    public SSLContext getJobSslContext() {
        return jobSslContext;
    }

    public void setJobSslContext(SSLContext jobSslContext) {
        this.jobSslContext = jobSslContext;
    }

    @JsonIgnore
    public DatabaseClientFactory.SSLHostnameVerifier getJobSslHostnameVerifier() {
        return jobSslHostnameVerifier;
    }

    public void setJobSslHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier jobSslHostnameVerifier) {
        this.jobSslHostnameVerifier = jobSslHostnameVerifier;
    }

    public String getJobCertFile() {
        return jobCertFile;
    }

    public void setJobCertFile(String jobCertFile) {
        this.jobCertFile = jobCertFile;
    }

    @JsonIgnore
    public String getJobCertPassword() {
        return jobCertPassword;
    }

    public void setJobCertPassword(String jobCertPassword) {
        this.jobCertPassword = jobCertPassword;
    }

    public String getJobExternalName() {
        return jobExternalName;
    }

    public void setJobExternalName(String jobExternalName) {
        this.jobExternalName = jobExternalName;
    }

    @JsonIgnore
    public X509TrustManager getJobTrustManager() {
        return jobTrustManager;
    }

    public void setJobTrustManager(X509TrustManager jobTrustManager) {
        this.jobTrustManager = jobTrustManager;
    }

    public String getModulesDbName() {
        return modulesDbName;
    }

    public void setModulesDbName(String modulesDbName) {
        this.modulesDbName = modulesDbName;
    }

    public Boolean getIsHostLoadBalancer() {
        return isHostLoadBalancer;
    }

    public void setIsHostLoadBalancer(Boolean hostLoadBalancer) {
        isHostLoadBalancer = hostLoadBalancer;
    }

    public String getStagingDbName() {
        return stagingDbName;
    }

    public void setStagingDbName(String stagingDbName) {
        this.stagingDbName = stagingDbName;
    }

    public String getFinalDbName() {
        return finalDbName;
    }

    public void setFinalDbName(String finalDbName) {
        this.finalDbName = finalDbName;
    }

    public String getJobDbName() {
        return jobDbName;
    }

    public void setJobDbName(String jobDbName) {
        this.jobDbName = jobDbName;
    }

    public String getStagingTriggersDbName() {
        return stagingTriggersDbName;
    }

    public void setStagingTriggersDbName(String stagingTriggersDbName) {
        this.stagingTriggersDbName = stagingTriggersDbName;
    }

    public String getFinalTriggersDbName() {
        return finalTriggersDbName;
    }

    public void setFinalTriggersDbName(String finalTriggersDbName) {
        this.finalTriggersDbName = finalTriggersDbName;
    }

    public String getStagingSchemasDbName() {
        return stagingSchemasDbName;
    }

    public void setStagingSchemasDbName(String stagingSchemasDbName) {
        this.stagingSchemasDbName = stagingSchemasDbName;
    }

    public String getFinalSchemasDbName() {
        return finalSchemasDbName;
    }

    public void setFinalSchemasDbName(String finalSchemasDbName) {
        this.finalSchemasDbName = finalSchemasDbName;
    }

    @JsonIgnore
    public ManageConfig getManageConfig() {
        return manageConfig;
    }

    public void setManageConfig(ManageConfig manageConfig) {
        this.manageConfig = manageConfig;
    }

    public String getModulePermissions() {
        return modulePermissions;
    }

    public void setModulePermissions(String modulePermissions) {
        this.modulePermissions = modulePermissions;
    }
}
