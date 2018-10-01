package com.marklogic.hub.util;

import com.marklogic.hub.HubTestBase;

public class UnInstaller extends Installer {

    public static void main(String[] args) {
        Installer i = new Installer();
        i.teardownHub();
    }


}
