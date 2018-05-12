package com.marklogic.hub.util;

import com.marklogic.hub.HubTestBase;
import org.junit.Test;

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
        htb.createProjectDir();
        htb.getDataHub().install();
    }

    // A method to manually teardown.
    // uncomment @Test and run
    // do NOT check in as a a test.
    @Test
    public void uninstallHub() {
        htb.createProjectDir();
        htb.getDataHub().uninstall();
        htb.deleteProjectDir();

    }

}
