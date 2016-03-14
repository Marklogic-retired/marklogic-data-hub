package com.marklogic.hub;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.marklogic.contentpump.ContentPump;
import com.marklogic.contentpump.utilities.OptionsFileUtil;

public class DataHubContentPump extends ContentPump {
    private final static Logger LOGGER = LoggerFactory.getLogger(DataHubContentPump.class);

    private String[] arguments;

    public DataHubContentPump(List<String> arguments) {
        this(arguments.toArray(new String[0]));
    }

    public DataHubContentPump(String[] arguments) {
        this.arguments = arguments;
    }

    /**
     * Run the Content Pump.
     *
     * @return true if the content pump executed successfully, false otherwise.
     * @throws IOException 
     */
    public void execute() throws IOException {
        String[] expandedArgs = null;
        
        PrintStream sysout = System.out;
        PrintStream mlcpOutputStream = null;
        BufferedReader mlcpBufferedReader = null;
        File mlcpOutputFile = null;
        try {
            // redirect standard output
            mlcpOutputFile = File.createTempFile("mlcp", ".txt");
            mlcpOutputStream = new PrintStream(mlcpOutputFile);
            System.setOut(mlcpOutputStream);
            
            // run mlcp
            expandedArgs = OptionsFileUtil.expandArguments(arguments);
            runCommand(expandedArgs);
        } catch (Exception ex) {
            LOG.error("Error while expanding arguments", ex);
            System.err.println(ex.getMessage());
            System.err.println("Try 'mlcp help' for usage.");
        } finally {
            // close the mlcp output stream
            if (mlcpOutputStream != null) {
                mlcpOutputStream.close();
            }
            
            // revert to the original standard output
            System.setOut(sysout);
        }
        
        // read the mlcp output and get any error message
        StringBuilder errorMessage = new StringBuilder();
        try {
            String regex = "([^\\s]*) \\s (\\[ [^ \\] ]*? \\]) \\s ([^\\s]*) \\s ([^\\s]*) \\s - \\s (.*)";
            Pattern pattern = Pattern.compile(regex, Pattern.COMMENTS);

            mlcpBufferedReader = new BufferedReader(new InputStreamReader(new FileInputStream(mlcpOutputFile)));
            String line = null;
            while ((line = mlcpBufferedReader.readLine()) != null) {
                Matcher matcher = pattern.matcher(line);
                if (matcher.matches()) {
                    String logLevel = matcher.groupCount() >= 3 ? matcher.group(3) : "";
                    String message = matcher.groupCount() >= 5 ? matcher.group(5) : "";
                    if (logLevel.toLowerCase().equals("error")) {
                        if (errorMessage.length() > 0) {
                            errorMessage.append("\r\n");
                        }
                        errorMessage.append(message);
                    }
                }
            }
        } catch (PatternSyntaxException e) {
            LOGGER.error("Unexpected error", e);
        } catch (FileNotFoundException e) {
            LOGGER.error("Unexpected error", e);
        } catch (IOException e) {
            LOGGER.error("Unexpected error", e);
        } finally {
            if (mlcpBufferedReader != null) {
                try {
                    mlcpBufferedReader.close();
                } catch (IOException e) {
                    // intentionally empty
                }
            }
            
            // delete the temporary file
            mlcpOutputFile.delete();
        }
        
        if (errorMessage.length() > 0) {
            throw new IOException("Load data failed with:\r\n" + errorMessage.toString());
        }
    }
}
