package com.marklogic.hub.util;


import com.marklogic.hub.config.ApplicationConfig;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.marklogic.hub.HubTestBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import javax.annotation.PostConstruct;

@EnableAutoConfiguration
public class Installer extends HubTestBase {

    private static Logger logger = LoggerFactory.getLogger(Installer.class);

    public void setupProject() {
        createProjectDir();
    }

    public void teardownProject() {
        deleteProjectDir();
    }

    @PostConstruct
    public void bootstrapHub() {
        super.init();
        dataHub.install();
        try {
            //dataHub.upgradeHub();
            // this throws exception right now.
        } catch (Exception e) {
            logger.warn("Upgrade threw an exception during test bootstrapping");

        }
    }

    public static void main(String[] args) {
        SpringApplication.run(new Class[]{Installer.class, ApplicationConfig.class}, new String[] { });
    }

}
