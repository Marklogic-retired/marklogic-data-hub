package com.marklogic.hub.util;

import com.marklogic.hub.HubTestBase;
import org.junit.Test;

public class Installer {


    HubTestBase htb;

    public void installHubOnce() {
        htb.createProjectDir();
        htb.getDataHub().install();
    }

    public void uninstallHub() {
        htb.createProjectDir();
        htb.getDataHub().uninstall();
        htb.deleteProjectDir();

    }
    public Installer() {
        htb = new HubTestBase();
        if(htb.isSslRun() || htb.isCertAuth()) {
            htb.sslCleanup();
        }
    }

    public void main() {
        Installer installer = new Installer();
        installer.installHubOnce();
        //installer.uninstallHub();
    }
}
