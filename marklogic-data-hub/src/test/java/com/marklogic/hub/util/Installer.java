package com.marklogic.hub.util;


import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.deploy.commands.LoadHubModulesCommand;
import com.marklogic.hub.deploy.commands.LoadUserStagingModulesCommand;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

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
