package com.marklogic.hub.central;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.ext.ConfiguredDatabaseClientFactory;
import com.marklogic.client.ext.DatabaseClientConfig;
import com.marklogic.client.ext.DefaultConfiguredDatabaseClientFactory;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.util.PropertySource;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.net.ssl.SSLContext;
import java.util.Properties;

/**
 * Captures configuration at the application level.
 */
@Component
public class HubCentral extends LoggingObject implements InitializingBean {

    @Autowired
    Environment environment;

    @Value("${mlHost:localhost}")
    String host;

    /**
     * When the application starts up, initialize a project at the configured project path. This will go away before
     * 5.3.0, once Hub Central no longer depends on a HubProject. In the meantime, we need this as a bridge.
     */
    @Override
    public void afterPropertiesSet() {
        logger.info("Will connect to MarkLogic host: " + host);
        logger.info("Hub Central is available at port: " + environment.getProperty("server.port"));
    }

    /**
     * This constructs a HubConfigImpl by starting with the default property values in HubConfigImpl, and then applying
     * properties based on the Spring environment of this application plus the username/password provided by the user
     * logging in.
     *
     * @param username
     * @param password
     * @return
     */
    public HubConfigImpl newHubConfig(String username, String password) {
        HubConfigImpl hubConfig = new HubConfigImpl();
        DatabaseClient client = getStagingDbClient(username, password);
        Properties primaryProperties = HubConfigImpl.getHubPropertiesFromDb(client);
        hubConfig.applyProperties(buildPropertySource(username, password, primaryProperties));
        return hubConfig;
    }

    /**
     * This constructs a HubConfigImpl by starting with the default property values in HubConfigImpl, and then applying
     * properties based on the Spring environment of this application plus the username/password provided by the user
     * logging in.
     *
     * @param cloudApiKey
     * @return
     */
    public HubConfigImpl newHubConfig(String cloudApiKey) {
        HubConfigImpl hubConfig = new HubConfigImpl();
        DatabaseClient client = getStagingDbClient(cloudApiKey);
        Properties primaryProperties = hubConfig.getHubPropertiesFromDb(client);
        primaryProperties.setProperty("mlCloudApiKey", cloudApiKey);
        primaryProperties.setProperty("mlStagingBasePath", CloudParameters.STAGING_BASE_PATH);
        primaryProperties.setProperty("mlFinalBasePath", CloudParameters.FINAL_BASE_PATH);
        primaryProperties.setProperty("mlJobBasePath", CloudParameters.JOB_BASE_PATH);

        primaryProperties.setProperty("mlManageBasePath", CloudParameters.MANAGE_BASE_PATH);
        primaryProperties.setProperty("mlAppServicesBasePath", CloudParameters.APP_SERVICES_BASE_PATH);
        primaryProperties.setProperty("mlAdminBasePath", CloudParameters.ADMIN_BASE_PATH);

        primaryProperties.setProperty("mlAdminSimpleSsl", "true");
        primaryProperties.setProperty("mlManageSimpleSsl", "true");
        primaryProperties.setProperty("mlAppServicesSimpleSsl", "true");

        primaryProperties.setProperty("mlAuthentication", CloudParameters.AUTHENTICATION_TYPE);
        primaryProperties.setProperty("mlSslHostnameVerifier", "ANY");
        primaryProperties.setProperty("mlManageAuthentication", "cloud");
        hubConfig.applyProperties(buildPropertySource(primaryProperties));
        return hubConfig;
    }

    /**
     * Construct a PropertySource based on the properties in the Spring Boot environment plus the given username and
     * password, which are supplied when a user authenticates.
     *
     * @param username
     * @param password
     * @return
     */
    protected PropertySource buildPropertySource(String username, String password) {
        return buildPropertySource(username, password, new Properties());
    }

    protected PropertySource buildPropertySource(String username, String password, Properties primaryProperties) {
        primaryProperties.setProperty("mlUsername", username);
        primaryProperties.setProperty("mlPassword", password);
        return buildPropertySource(primaryProperties);
    }

    protected PropertySource buildPropertySource(Properties primaryProperties) {
        return propertyName -> {
            String value = primaryProperties.getProperty(propertyName);
            if (!propertyName.equals("mlUsername") && !propertyName.equals("mlPassword") && !propertyName.equals("mlAuthentication") && environment.getProperty(propertyName) != null) {
                value = environment.getProperty(propertyName);
            }
            return value;
        };
    }

    private DatabaseClient getStagingDbClient(String username, String password) {
        DatabaseClientConfig config = new DatabaseClientConfig();
        config.setUsername(username);
        config.setPassword(password);
        config.setCloudApiKey("");
        return getStagingDbClient(config);
    }

    private DatabaseClient getStagingDbClient(String cloudApiKey) {
        DatabaseClientConfig config = new DatabaseClientConfig();
        config.setCloudApiKey(cloudApiKey);

        SSLContext stagingSslContext = SimpleX509TrustManager.newSSLContext();
        DatabaseClientFactory.SSLHostnameVerifier stagingSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
        SimpleX509TrustManager stagingTrustManager = new SimpleX509TrustManager();

        config.setSslHostnameVerifier(stagingSslHostnameVerifier);
        config.setSslContext(stagingSslContext);
        config.setCertFile(null);
        config.setCertPassword(null);
        config.setExternalName(null);
        config.setTrustManager(stagingTrustManager);
        config.setUsername("");
        config.setPassword("");

        return getStagingDbClient(config);
    }

    private DatabaseClient getStagingDbClient(DatabaseClientConfig config) {
        ConfiguredDatabaseClientFactory configuredDatabaseClientFactory = new DefaultConfiguredDatabaseClientFactory();
        if(CloudParameters.AUTHENTICATION_TYPE.equals("cloud")) {
            config.setHost(CloudParameters.ML_HOST);
            config.setPort(CloudParameters.ML_REVERSE_PROXY_PORT);
            config.setBasePath(CloudParameters.STAGING_BASE_PATH);
            config.setSecurityContextType(SecurityContextType.CLOUD);
        } else {
            config.setHost(environment.getProperty("mlHost") != null ?
                environment.getProperty("mlHost") :
                "localhost"
            );
            config.setPort(environment.getProperty("mlStagingPort") != null ?
                Integer.parseInt(environment.getProperty("mlStagingPort")) :
                8010
            );
            config.setSecurityContextType(environment.getProperty("mlStagingAuth") != null ?
                SecurityContextType.valueOf(environment.getProperty("mlStagingAuth").toUpperCase()) :
                SecurityContextType.valueOf("DIGEST")
            );
        }
        // Need to work on SSL
        return configuredDatabaseClientFactory.newDatabaseClient(config);
    }

    public String getHost() {
        return host;
    }

    public static String getProjectName() {
        return "Data Hub Project";
    }
}
