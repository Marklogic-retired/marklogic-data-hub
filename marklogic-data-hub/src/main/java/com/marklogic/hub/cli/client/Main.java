package com.marklogic.hub.cli.client;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;

/**
 * Main program for the executable DHF client jar.
 */
public class Main {

    public static void main(String[] args) {
        try {
            runCommand(args);
        } catch (ParameterException ex) {
            System.err.println(ex.getMessage());
        }
        System.exit(0);
    }

    /**
     * Runs the specified command, but does not call System.exit. This is to allow for automated testing.
     *
     * @param args
     */
    public static void runCommand(String[] args) {
        JCommander commander = JCommander
            .newBuilder()
            .addCommand("runFlow", new RunFlowCommand())
            .build();
        commander.setProgramName("java -jar <name of jar>");

        commander.parse(args);
        String parsedCommand = commander.getParsedCommand();
        if (parsedCommand == null) {
            commander.usage();
        } else {
            ((Runnable) commander.getCommands().get(parsedCommand).getObjects().get(0)).run();
        }
    }

}
