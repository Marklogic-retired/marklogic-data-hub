package com.marklogic.hub.config;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.AdminManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import java.util.Properties;

@Configuration
@ComponentScan(basePackages = { "com.marklogic.hub.impl", "com.marklogic.hub.deploy.commands" })
public class ApplicationConfig {

    private static final Logger logger = LoggerFactory
        .getLogger(ApplicationConfig.class);

    @Bean
    @Qualifier("currentDirectory")
    public HubProject getDefaultProject() {
       return new HubProjectImpl("ye-olde-project");
    }


    public static void main(String[] args) {
        logger.info("Starting DHF Application Context");
        SpringApplication.run(ApplicationConfig.class);
    }

}

