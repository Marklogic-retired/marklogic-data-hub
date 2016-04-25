package com.marklogic.hub;

import java.io.File;
import java.util.regex.Pattern;

import com.marklogic.hub.flow.FlowType;

public class ScaffoldingValidator {

    public static boolean isUniqueRestServiceExtension(File pluginsDir, String name) {
        String entityNameFilter = "[a-zA-Z0-9_.-]+";
        String flowTypeFilter = "(" + FlowType.INPUT + "|" + FlowType.HARMONIZE + ")";
        String pluginFormatFilter = "(" + PluginFormat.XQUERY + "|" + PluginFormat.JAVASCRIPT + ")";
        String absoluteFilePathFilter = Scaffolding.getAbsolutePath(pluginsDir.getAbsolutePath(), "entities", entityNameFilter, flowTypeFilter, "REST", "services", name + "." + pluginFormatFilter);
        return !checkIfFileExists(pluginsDir, absoluteFilePathFilter);
    }

    private static boolean checkIfFileExists(File rootDirectory, String absoluteFilePathFilter) {
        File[] list = rootDirectory.listFiles();
        if (list != null) {
            for (File file : list) {
                if (file.isDirectory()) {
                    if(checkIfFileExists(file, absoluteFilePathFilter)) {
                        return true;
                    }
                } else {
                    absoluteFilePathFilter = absoluteFilePathFilter.replace("\\", "\\\\");

                    if(Pattern.matches(absoluteFilePathFilter,file.getAbsolutePath())) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public boolean checkIfFolderExists(File rootDirectory, String absoluteFilePathFilter) {
        File[] list = rootDirectory.listFiles();
        if (list != null) {
            for (File file : list) {
                if (file.isDirectory()) {
                    if(Pattern.matches(absoluteFilePathFilter,file.getAbsolutePath())) {
                        return true;
                    }
                    checkIfFileExists(file, absoluteFilePathFilter);
                }
            }
        }
        return false;
    }

    public static boolean isUniqueRestTransform(File pluginsDir, String name) {
        String entityNameFilter = "[a-zA-Z0-9_.-]+";
        String flowTypeFilter = "(" + FlowType.INPUT + "|" + FlowType.HARMONIZE + ")";
        String pluginFormatFilter = "(" + PluginFormat.XQUERY + "|" + PluginFormat.JAVASCRIPT + ")";
        String absoluteFilePathFilter = Scaffolding.getAbsolutePath(pluginsDir.getAbsolutePath(), "entities", entityNameFilter, flowTypeFilter, "REST", "transforms", name + "." + pluginFormatFilter);
        return !checkIfFileExists(pluginsDir, absoluteFilePathFilter);
    }

}
