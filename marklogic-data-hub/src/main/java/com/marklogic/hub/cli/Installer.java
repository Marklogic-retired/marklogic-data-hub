package com.marklogic.hub.cli;

import com.beust.jcommander.JCommander;

/**
 * Intended for installing and upgrading DHF via a command-line interface. It is expected to be run as the main class
 * of the jar produced by the "bootJar" Gradle task.
 * <p>
 * To mimic how DHF is installed locally, this installer will first initialize a DHF project in the directory in which
 * the installer is run. Properties will then be read from the gradle.properties and gradle-local.properties files that
 * are generated.
 * <p>
 * Because those properties are not intended to suffice for installation - specifically, mlUsername and mlPassword are
 * not expected to be set - a client can override any DHF property via JVM props when running the installer. For example:
 * <p>
 * {@code
 * java -DmlUsername=someuser -PmlPassword=somepassword -jar marklogic-data-hub-(version).jar
 * }
 */
public class Installer {

    /**
     * For an upgrade - the command can return its version and what versions it can upgrade from.
     * <p>
     * Let's say 5.0.2 is the first version on DHS.
     * Then 5.1.0 comes out. It would be able to upgrade from 5.0.2.
     * Then 5.2.0 comes out. It can upgrade from 5.1.0 (via some class) and from 5.0.2 to 5.1.0 (via another class). Or
     * maybe that's just one class, from 5.0.2 to 5.2.0, which reuses the 5.0.2 to 5.1.0 and optimizes as necessary.
     * <p>
     * So a user is on 5.0.2. They want to upgrade. DHS should be able to use the DHF installer(s?) to tell the user
     * they can upgrade to 5.1.0 and 5.2.0. But I think DHS should consult multiple installers to find that out, as
     * perhaps 5.1.0 relies on a file that's no longer in 5.2.0 - but perhaps that's considered a breaking change that
     * should require a major version change.
     * <p>
     * Ideally, the 5.2.0 jar can inform what versions can be upgraded to - 5.1 and 5.2 - and then based on what the user
     * chooses, DHS selects the appropriate installer.
     * <p>
     * I think the "upgrade" command can then do whatever upgrade work is necessary and then install the latest version
     * - order doesn't matter, it's an implementation detail, as the client will just say "please upgrade".
     *
     * @param args
     */
    public static void main(String[] args) {
        Options options = new Options();
        JCommander commander = JCommander
            .newBuilder()
            .addObject(options)
            .addCommand("dhsInstall", new InstallDhfInDhsCommand())
            .addCommand("dhsVerify", new VerifyDhfInDhsCommand())
            .addCommand("localInstall", new InstallLocalDhfCommand())
            .addCommand("localVerify", new VerifyLocalDhfCommand())
            .addCommand("upgradeInfo", new UpgradeInfoCommand())
            .build();

        commander.setProgramName("java -jar <name of jar>");
        commander.parse(args);

        String parsedCommand = commander.getParsedCommand();
        if (parsedCommand == null) {
            commander.usage();
        } else {
            InstallerCommand command = (InstallerCommand) commander.getCommands().get(parsedCommand).getObjects().get(0);
            command.run(options);
        }
    }
}

