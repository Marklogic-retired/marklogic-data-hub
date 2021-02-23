package com.marklogic.hub.central;

import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.util.PropertySource;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.io.File;
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
        hubConfig.applyProperties(buildPropertySource(username, password));
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
        Properties primaryProperties = new Properties();
        primaryProperties.setProperty("mlUsername", username);
        primaryProperties.setProperty("mlPassword", password);

        return propertyName -> {
            String value = primaryProperties.getProperty(propertyName);
            if (value != null) {
                return value;
            }
            return environment.getProperty(propertyName);
        };
    }

    public String getHost() {
        return host;
    }

    public String getProjectName() {
        return "Data Hub Project";
    }
}
