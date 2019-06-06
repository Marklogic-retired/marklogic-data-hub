package com.marklogic.hub.cli;

import com.beust.jcommander.JCommander;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.impl.DataHubImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

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

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(ApplicationConfig.class);
        final DataHubImpl dataHub = context.getBean(DataHubImpl.class);
        final HubConfigImpl hubConfig = context.getBean(HubConfigImpl.class);

        Options options = new Options();
        JCommander commander = JCommander
            .newBuilder()
            .addObject(options)
            .addCommand("dhsInstall", new InstallDhfInDhsCommand(dataHub, hubConfig))
            .addCommand("dhsVerify", new VerifyDhfInDhsCommand(hubConfig))
            .addCommand("localInstall", new InstallLocalDhfCommand(dataHub, hubConfig))
            .addCommand("localVerify", new VerifyLocalDhfCommand(hubConfig))
            .build();

        try {
            commander.setProgramName("java -jar <name of jar>");
            commander.parse(args);

            String parsedCommand = commander.getParsedCommand();
            if (parsedCommand == null) {
                commander.usage();
            } else {
                InstallerCommand command = (InstallerCommand) commander.getCommands().get(parsedCommand).getObjects().get(0);
                command.run(options);
            }
        } finally {
            context.close();
        }
    }
}

