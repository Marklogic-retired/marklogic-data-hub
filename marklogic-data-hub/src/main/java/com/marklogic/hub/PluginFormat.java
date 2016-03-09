package com.marklogic.hub;

public enum PluginFormat {
    JAVASCRIPT("sjs"), XQUERY("xqy");

    private String name;

    PluginFormat(String name) {
        this.name = name;
    }

    public static PluginFormat getPluginFormat(String format) {
        for (PluginFormat pluginFormat : PluginFormat.values()) {
            if (pluginFormat.toString().equals(format)) {
                return pluginFormat;
            }
        }
        return null;
    }

    public String toString() {
        return name;
    }
}
