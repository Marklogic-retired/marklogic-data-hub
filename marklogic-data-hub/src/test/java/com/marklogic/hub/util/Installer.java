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

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {ApplicationConfig.class})
@EnableAutoConfiguration
public class Installer {

    @Autowired
    HubTestBase htb;

    private static Logger logger = LoggerFactory.getLogger(Installer.class);

    public void setupProject() {
        htb.createProjectDir();
    }

    public void teardownProject() {
        htb.deleteProjectDir();
    }

    @PostConstruct
    public void bootstrapHub() {
        htb.createProjectDir();
        if (htb.isCertAuth() || htb.isSslRun()) {
            htb.sslSetup();
        }
        htb.getDataHub().install();
        try {
            htb.getDataHub().upgradeHub();
        } catch (Exception e) {
            logger.warn("Upgrade threw an exception during test bootstrapping");

        }
}
    public static void main(String[] args) {
        SpringApplication.run(Installer.class);
    }

    public void teardownHub() {
    	htb.createProjectDir();
        htb.getDataHub().uninstall();
        if (htb.isCertAuth() || htb.isSslRun()) {
        	htb.sslCleanup();
        }
        try {
        	htb.deleteProjectDir();
        }
        catch(Exception e) {
        	logger.warn("Unable to delete the project directory", e);
        }
    }
}
