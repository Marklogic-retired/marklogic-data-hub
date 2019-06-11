package com.marklogic.hub.cli.upgrader;

import com.marklogic.hub.cli.InstallerCommand;
import com.marklogic.hub.cli.Options;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.Arrays;
import java.util.List;

/**
 * If this upgrader needed to do anything, it could use the Spring context to grab whatever objects
 * it needs to make changes either before or after running the command.
 * <p>
 * But for 5.0.0 to 5.0.1, it would just run whatever command it's been given. It doesn't need
 * to worry about changes to existing resources and modules, it just runs the command.
 * <p>
 * So how does a user request this? The installer can check the modules database to determine what version
 * of DHF already exists. Assuming DHS uses the installer for the requested version, then the command
 * would just need to find the Upgrader that matches the existing version.
 * <p>
 * What's not clear is when the upgrader does its thing - before, during, or after the install of the
 * target version. We likely won't know that until we have an upgrader that needs to do something.
 * <p>
 * Perhaps this is just built into the install commands. They can check to see if DHF exists already, and
 * if so, they'll delegate their execution to an upgrader. Then the CLI doesn't have to do anything special.
 * <p>
 * java -jar .jar
 */
public class Version500Upgrader implements Upgrader {

    @Override
    public String getTargetVersion() {
        return "5.0.1";
    }

    @Override
    public List<String> getSupportedVersions() {
        return Arrays.asList("5.0.0");
    }

    @Override
    public void beforeInstall(ConfigurableApplicationContext context, InstallerCommand command, Options options) {

    }

    @Override
    public void afterInstall(ConfigurableApplicationContext context, InstallerCommand command, Options options) {

    }
}
