package com.marklogic.quickstart.model;

import com.marklogic.client.io.Format;
import com.marklogic.hub.PluginFormat;

public class FlowModel {

    public String entityName;
    public String flowName;
    public PluginFormat pluginFormat;
    public Format dataFormat;

    public FlowModel() {}

    public FlowModel(String entityName, String flowName) {
        this.entityName = entityName;
        this.flowName = flowName;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("entityName=");
        sb.append(entityName);
        sb.append("flowName=");
        sb.append(flowName);
        sb.append("}");

        return sb.toString();
    }
}
