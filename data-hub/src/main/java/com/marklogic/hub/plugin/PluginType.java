package com.marklogic.hub.plugin;

public enum PluginType {

    XQUERY("xquery"), JAVASCRIPT("javascript"), XSLT("xslt"), XML("xml"), JSON("json"), NULL("null");

    private String type;
    PluginType(String type) {
        this.type = type;
    }

    public static PluginType getPluginType(String type) {
        for (PluginType pluginType : PluginType.values()) {
            if (pluginType.toString().equals(type)) {
                return pluginType;
            }
        }
        return null;
    }

    public String toString() {
        return type;
    }
}
