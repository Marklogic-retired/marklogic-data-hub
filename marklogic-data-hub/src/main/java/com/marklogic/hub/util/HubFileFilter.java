package com.marklogic.hub.util;

import java.io.File;
import java.io.FileFilter;

/**
 * Simple implementation that accepts every file and ignores anything starting with ".".
 */
public class HubFileFilter implements FileFilter {

    @Override
    public boolean accept(File f) {
        boolean result = f != null && !f.getName().startsWith(".") && !f.toString().matches(".*[/\\\\]REST[/\\\\].*");
        return result;
    }

}
