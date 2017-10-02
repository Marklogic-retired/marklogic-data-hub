package com.marklogic.hub.util;

import org.apache.commons.io.IOUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class FileUtil {

    public static void copy(InputStream source, File destination) {
        try {
            FileOutputStream fos = new FileOutputStream(destination);
            IOUtils.copy(source, fos);
            fos.flush();
            fos.close();
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
