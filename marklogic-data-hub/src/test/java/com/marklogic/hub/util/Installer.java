package com.marklogic.hub.util;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.marklogic.hub.HubTestBase;

public class Installer {

    HubTestBase htb;
    private static Logger logger = LoggerFactory.getLogger(Installer.class);
    public Installer() {
        htb = new HubTestBase();
    }

    public void setupProject() {
        htb.createProjectDir();
    }

    public void teardownProject() {
        htb.deleteProjectDir();
    }

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
        Installer i = new Installer();
        i.bootstrapHub();
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
