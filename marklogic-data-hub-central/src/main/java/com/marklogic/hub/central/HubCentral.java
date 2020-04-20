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
        Properties hubDefaultProperties = HubConfigImpl.newDefaultProperties();

        Properties primaryProperties = new Properties();
        primaryProperties.setProperty("mlUsername", username);
        primaryProperties.setProperty("mlPassword", password);
        primaryProperties.setProperty("mlAppServicesUsername", username);
        primaryProperties.setProperty("mlAppServicesPassword", password);

        if (useLocalDefaults) {
            primaryProperties.setProperty("mlIsHostLoadBalancer", "false");
            primaryProperties.setProperty("mlAppServicesPort", "8000");
            primaryProperties.setProperty("mlAppServicesAuthentication", "digest");
            primaryProperties.setProperty("mlFinalAuth", "digest");
            primaryProperties.setProperty("mlJobAuth", "digest");
            primaryProperties.setProperty("mlStagingAuth", "digest");
            primaryProperties.setProperty("mlAppServicesSimpleSsl", "false");
            primaryProperties.setProperty("mlFinalSimpleSsl", "false");
            primaryProperties.setProperty("mlJobSimpleSsl", "false");
            primaryProperties.setProperty("mlStagingSimpleSsl", "false");
        }

        return propertyName -> {
            String value = primaryProperties.getProperty(propertyName);
            if (value != null) {
                return value;
            }
            value = environment.getProperty(propertyName);
            if (value != null && value.trim().length() > 0) {
                return value;
            }
            return hubDefaultProperties.getProperty(propertyName);
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
