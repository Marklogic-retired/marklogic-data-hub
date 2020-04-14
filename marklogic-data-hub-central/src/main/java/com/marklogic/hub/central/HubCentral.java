package com.marklogic.hub.central;

import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import com.marklogic.mgmt.util.PropertySource;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

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

    @Value("${hubProjectPath:build/hub-central-test-project}")
    String projectPath;

    @Value("${hubUseLocalDefaults:false}")
    boolean useLocalDefaults;

    // TODO This is temporary, until HC no longer depends on a HubProject
    private HubProject hubProject;

    /**
     * When the application starts up, initialize a project at the configured project path. This will go away before
     * 5.3.0, once Hub Central no longer depends on a HubProject. In the meantime, we need this as a bridge.
     */
    @Override
    public void afterPropertiesSet() {
        logger.info("Will connect to MarkLogic host: " + host);

        hubProject = new HubProjectImpl();
        logger.info("Temporarily initializing project at: " + projectPath);
        hubProject.createProject(projectPath);

        HubConfigImpl tempHubConfig = new HubConfigImpl(hubProject, environment);
        tempHubConfig.initHubProject();
        logger.info("Initialized project at: " + getProjectDirectory());

        if (useLocalDefaults) {
            logger.info("Local defaults of digest authentication and no SSL will be used when connecting to MarkLogic");
        }

        logger.info("Hub Central is available at port: " + environment.getProperty("server.port"));
    }

    public HubConfigImpl newHubConfig(String username, String password) {
        HubConfigImpl hubConfig = new HubConfigImpl(hubProject, environment);
        hubConfig.setMlUsername(username);
        hubConfig.setMlPassword(password);
        hubConfig.applyProperties(buildPropertySource(username, password));
        return hubConfig;
    }

    /**
     * Construct a PropertySource based on the DHF default properties, the properties in the Spring Boot environment,
     * and the given username and password, which are supplied when a user authenticates.
     *
     * @param username
     * @param password
     * @return
     */
    protected PropertySource buildPropertySource(String username, String password) {
        Properties applicationProperties = HubConfigImpl.newDefaultProperties();
        applicationProperties.setProperty("mlUsername", username);
        applicationProperties.setProperty("mlPassword", password);
        applicationProperties.setProperty("mlAppServicesUsername", username);
        applicationProperties.setProperty("mlAppServicesPassword", password);

        Properties localDefaultProperties = new Properties();
        if (useLocalDefaults) {
            localDefaultProperties.setProperty("mlIsHostLoadBalancer", "false");
            localDefaultProperties.setProperty("mlAppServicesPort", "8000");
            localDefaultProperties.setProperty("mlAppServicesAuthentication", "digest");
            localDefaultProperties.setProperty("mlFinalAuth", "digest");
            localDefaultProperties.setProperty("mlJobAuth", "digest");
            localDefaultProperties.setProperty("mlStagingAuth", "digest");
            localDefaultProperties.setProperty("mlAppServicesSimpleSsl", "false");
            localDefaultProperties.setProperty("mlFinalSimpleSsl", "false");
            localDefaultProperties.setProperty("mlJobSimpleSsl", "false");
            localDefaultProperties.setProperty("mlStagingSimpleSsl", "false");
        }

        return propertyName -> {
            String value = localDefaultProperties.getProperty(propertyName);
            if (value != null) {
                return value;
            }
            value = environment.getProperty(propertyName);
            if (value != null) {
                return value;
            }
            return applicationProperties.getProperty(propertyName);
        };
    }

    public String getHost() {
        return host;
    }

    public String getProjectName() {
        return hubProject.getProjectName();
    }

    public String getProjectDirectory() {
        return hubProject.getProjectDir().toString();
    }
}
