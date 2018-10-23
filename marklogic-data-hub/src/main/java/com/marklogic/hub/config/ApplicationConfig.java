package com.marklogic.hub.config;

import com.marklogic.hub.HubProject;
import com.marklogic.hub.impl.HubProjectImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * This application configuration is an entry point to using the DHF from a set property
 */
@Configuration
@ComponentScan(basePackages = { "com.marklogic.hub.impl", "com.marklogic.hub.deploy.commands" })
@EnableAutoConfiguration
public class ApplicationConfig {

    private static final Logger logger = LoggerFactory
        .getLogger(ApplicationConfig.class);

    @Bean
    public HubProject getDefaultProject(@Value("${hubProjectDir}") String projectDirectory) {
       return new HubProjectImpl(projectDirectory);
    }


    public static void main(String[] args) {
        logger.info("Starting DHF Application Context");
        SpringApplication.run(ApplicationConfig.class);
    }

}

