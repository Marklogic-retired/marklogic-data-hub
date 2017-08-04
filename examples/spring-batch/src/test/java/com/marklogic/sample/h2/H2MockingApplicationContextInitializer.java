package com.marklogic.sample.h2;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.ResourcePropertySource;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabase;
import org.springframework.mock.env.MockEnvironment;

import java.io.IOException;

public class H2MockingApplicationContextInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    public static final String DEFAULT_APPLICATION_PROPERTIES = "job.properties";

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        MockEnvironment env = new MockEnvironment();
        final MutablePropertySources propertySources = env.getPropertySources();
        //propertySources.addFirst(getApplicationProperties(env));
        env.setProperty("jdbc_driver", "org.h2.Driver");
        env.setProperty("jdbc_username", "sa");
        env.setProperty("jdbc_url", "jdbc:h2:mem:testdb");
        env.setProperty("chunk", "5");
        applicationContext.setEnvironment(env);

    }
/*
    protected PropertySource<?> getApplicationProperties(final ConfigurableEnvironment environment) {
        try {
            final Resource propertiesResource = new FileSystemResource(DEFAULT_APPLICATION_PROPERTIES);
            final ResourcePropertySource propertySource = new ResourcePropertySource(propertiesResource);
            logger.info("Configured application properties from: {}", propertySource);
            return propertySource;
        } catch (final IOException ex) {
            throw new RuntimeException("Unable to load application properties from default location: "
                    + DEFAULT_APPLICATION_PROPERTIES, ex);
        }
    }
    */
}
