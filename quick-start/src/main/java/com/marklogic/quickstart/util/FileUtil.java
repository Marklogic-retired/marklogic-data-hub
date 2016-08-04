package com.marklogic.quickstart.util;

import com.marklogic.client.helper.LoggingObject;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class FileUtil extends LoggingObject {

    public static List<String> listDirectFolders(File rootDirectory) {
        List<String> folders = new ArrayList<>();
        if (rootDirectory.exists() && rootDirectory.isDirectory()) {
            File[] files = rootDirectory.listFiles();
            for (File file : files) {
                if (file.isDirectory() && !file.isHidden()) {
                    folders.add(file.getName());
                }
            }
        }
        return folders;
    }

    public static List<String> listDirectFiles(String path) {
        List<String> filenames = new ArrayList<>();
        File rootDirectory = new File(path);
        if (rootDirectory.exists() && rootDirectory.isDirectory()) {
            File[] files = rootDirectory.listFiles();
            for (File file : files) {
                if (!file.isDirectory() && !file.isHidden()) {
                    filenames.add(file.getName());
                }
            }
        }
        return filenames;
    }
}
