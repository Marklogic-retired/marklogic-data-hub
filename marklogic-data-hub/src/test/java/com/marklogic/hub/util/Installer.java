package com.marklogic.hub.util;

import com.marklogic.hub.HubTestBase;

public class Installer {

    HubTestBase htb;

    public Installer() {
        htb = new HubTestBase();
    }

    // A method to manually setup
    // uncomment @Test and run
    // do NOT check in as a a test.
    // @Test
    public void installHubOnce() {
    	HubTestBase.setRequireAdmin(true);
        htb.createProjectDir();
        if (htb.isCertAuth() || htb.isSslRun()) {
        	htb.sslSetup();
        }
        htb.getDataHub(true).install();
        try {
           //htb.getDataHub(true).upgradeHub();
        } catch (Exception e) {

        }
        //setting 'requireAdmin' to false after installation
        HubTestBase.setRequireAdmin(false);
    }

    // A method to manually teardown.
    // uncomment @Test and run
    // do NOT check in as a a test.
    // @Test
    public void uninstallHub() {
    	HubTestBase.setRequireAdmin(true);
        htb.createProjectDir();
        htb.getDataHub(true).uninstall();
        if (htb.isCertAuth() || htb.isSslRun()) {
        	htb.sslCleanup();
        }
        htb.deleteProjectDir();        
    }
}