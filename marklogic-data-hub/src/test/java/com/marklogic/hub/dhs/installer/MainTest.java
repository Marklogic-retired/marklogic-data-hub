package com.marklogic.hub.dhs.installer;

import com.beust.jcommander.JCommander;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class MainTest {

    @Test
    void missingParams() {
        final PrintStream originalStream = System.err;

        JCommander commander = Main.initializeJCommander(new Options());

        ByteArrayOutputStream testOutput = new ByteArrayOutputStream();
        try {
            System.setErr(new PrintStream(testOutput, true));
            boolean result = Main.parseArgs(commander, new String[]{});
            assertFalse(result, "The args aren't valid because the required ones aren't specified");

            String errorOutput = new String(testOutput.toByteArray());
            assertTrue(errorOutput.contains("Please see the usage information above for required options and available commands"));
        } finally {
            System.setErr(originalStream);
        }
    }
}
