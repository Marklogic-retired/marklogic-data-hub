package com.marklogic.hub.util;


import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Installer {

    HubTestBase htb;
    private static Logger logger = LoggerFactory.getLogger(Installer.class);
    public Installer() {
        htb = new HubTestBase();
    }

    // A method to manually setup
    // uncomment @Test and run
    // do NOT check in as a a test.
    @Test
    public void installHubOnce() {
    	htb.createProjectDir();
        if (htb.isCertAuth() || htb.isSslRun()) {
        	htb.sslSetup();
        }
        htb.getDataHub().install();
        try {
        	htb.getDataHub().upgradeHub();
        } catch (Exception e) {

        }
    }

    // A method to manually teardown.
    // uncomment @Test and run
    // do NOT check in as a a test.
     @Test
    public void uninstallHub() {
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
