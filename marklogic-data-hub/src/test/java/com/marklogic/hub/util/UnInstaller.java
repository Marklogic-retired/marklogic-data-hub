package com.marklogic.hub.util;

import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.config.ApplicationConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;

import javax.annotation.PostConstruct;

@EnableAutoConfiguration
public class UnInstaller extends HubTestBase {

    private static Logger logger = LoggerFactory.getLogger(UnInstaller.class);

    public static void main(String[] args) {
        SpringApplication.run(new Class[]{UnInstaller.class, ApplicationConfig.class}, new String[]{});
    }

    @PostConstruct
    public void teardownHub() {
        super.init();
        dataHub.uninstall();
        if (isCertAuth() || isSslRun()) {
            sslCleanup();
        }
        try {
            deleteProjectDir();
        }
        catch(Exception e) {
            logger.warn("Unable to delete the project directory", e);
        }
    }

}
