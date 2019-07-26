package com.marklogic.hub.cli;

import com.beust.jcommander.JCommander;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.cli.command.InstallIntoDhsCommand;
import com.marklogic.hub.cli.command.VerifyDhfInDhsCommand;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

/**
 * Intended for installing and upgrading DHF via a command-line interface. It is expected to be run as the main class
 * of the jar produced by the "bootJar" Gradle task.
 * <p>
 * To mimic how DHF is installed locally, this installer will first initialize a DHF project in the directory in which
 * the installer is run. Properties will then be read from the gradle.properties and gradle-local.properties files that
 * are generated.
 */
public class Installer {

    public static void main(String[] args) {
        Options options = new Options();
        JCommander commander = JCommander
            .newBuilder()
            .addObject(options)
            .addCommand("dhsInstall", new InstallIntoDhsCommand())
            .addCommand("dhsVerify", new VerifyDhfInDhsCommand())
            .build();

        commander.setProgramName("java -jar <name of jar>");
        commander.parse(args);

        String parsedCommand = commander.getParsedCommand();
        if (parsedCommand == null) {
            commander.usage();
        } else {
            InstallerCommand command = (InstallerCommand) commander.getCommands().get(parsedCommand).getObjects().get(0);

            SpringApplication app = new SpringApplication(ApplicationConfig.class);
            app.setBannerMode(Banner.Mode.OFF);

            ConfigurableApplicationContext context = app.run();
            try {
                command.run(context, options);
            } finally {
                context.close();
            }
        }
    }
}

