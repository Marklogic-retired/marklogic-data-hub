package com.marklogic.bootstrap;


import com.marklogic.hub.ApplicationConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.marklogic.hub.HubTestBase;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.ConfigurableApplicationContext;

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
        teardownProject();
        setupProject();

        boolean isInstalled = false;
        try {
        	isInstalled = dataHub.isInstalled().isInstalled();
        }
        catch(Exception e) {
        	logger.info("Datahub is not installed");
        }
        if(! isInstalled) {
	        dataHub.install();
	        try {
	            //dataHub.upgradeHub();
	            // this throws exception right now.
	        } catch (Exception e) {
	            logger.warn("Upgrade threw an exception during test bootstrapping");

	        }
        }
        if(getHubAdminConfig().getIsProvisionedEnvironment()) {
            installHubModules();
        }
    }

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Installer.class, ApplicationConfig.class);
        app.setWebApplicationType(WebApplicationType.NONE);
        ConfigurableApplicationContext ctx = app.run();
    }

}
