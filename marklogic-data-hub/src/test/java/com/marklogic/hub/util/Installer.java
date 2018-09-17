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

    public void setupProject() {
        htb.createProjectDir();
        if (htb.isCertAuth() || htb.isSslRun()) {
            htb.sslSetup();
        }
    }

    public void teardownProject() {
        htb.createProjectDir();
        if (htb.isCertAuth() || htb.isSslRun()) {
            htb.sslCleanup();
        }
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
