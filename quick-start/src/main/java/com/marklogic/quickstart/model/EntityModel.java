package com.marklogic.quickstart.model;

import java.util.List;

import com.marklogic.hub.plugin.PluginFormat;

public class EntityModel {

    public String entityName;
    public List<FlowModel> inputFlows;
    public List<FlowModel> harmonizeFlows;
    public String model;

    public PluginFormat pluginFormat;

    public EntityModel() {}

    public EntityModel(String entityName) {
        this.entityName = entityName;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("entityName=");
        sb.append(entityName);
        sb.append("}");

        return sb.toString();
    }
}
