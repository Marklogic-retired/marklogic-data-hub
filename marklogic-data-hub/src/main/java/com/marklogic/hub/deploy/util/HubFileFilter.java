package com.marklogic.hub.deploy.util;

import java.io.File;
import java.io.FileFilter;

/**
 * Simple implementation that accepts every file and ignores anything starting with ".".
 */
public class HubFileFilter implements FileFilter {

    @Override
    public boolean accept(File f) {
        boolean result = f != null &&
            !f.getName().startsWith(".") &&
            !f.getName().endsWith("entity.json") &&
            !f.getName().equals(f.getParentFile().getName() + ".properties") &&
            !f.toString().matches(".*[/\\\\]REST[/\\\\].*") &&

            // ignore vim files ending in ~
            !f.getName().endsWith("~");
        return result;
    }

}
