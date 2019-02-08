package com.marklogic.hub;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * This application configuration is an entry point to using the DHF from a set property
 */
@Configuration
@ComponentScan(basePackages = {"com.marklogic.hub.impl", "com.marklogic.hub.legacy.impl", "com.marklogic.hub.deploy.commands",
    "com.marklogic.hub.job.impl"})
@EnableAutoConfiguration
public class ApplicationConfig {

    private static final Logger logger = LoggerFactory
        .getLogger(ApplicationConfig.class);

    public static void main(String[] args) {
        logger.info("Starting DHF Application Context");
        SpringApplication.run(ApplicationConfig.class);
    }

}

