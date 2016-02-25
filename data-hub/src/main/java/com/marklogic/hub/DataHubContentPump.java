package com.marklogic.hub;

import java.io.File;
import java.util.List;

import com.marklogic.contentpump.ContentPump;
import com.marklogic.contentpump.utilities.OptionsFileUtil;

public class DataHubContentPump extends ContentPump {

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
     */
    public boolean execute() {
        String[] expandedArgs = null;
        int rc = 1;
        try {
            expandedArgs = OptionsFileUtil.expandArguments(arguments);
            rc = runCommand(expandedArgs);
        } catch (Exception ex) {
            LOG.error("Error while expanding arguments", ex);
            System.err.println(ex.getMessage());
            System.err.println("Try 'mlcp help' for usage.");
        }
        
        return rc == 0;
    }
}
