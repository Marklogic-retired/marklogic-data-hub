package com.marklogic.quickstart.model;

import java.util.ArrayList;
import java.util.List;

import com.marklogic.client.io.Format;
import com.marklogic.hub.plugin.PluginFormat;

public class FlowModel {

    public String entityName;
    public String flowName;
    public PluginFormat pluginFormat;
    public Format dataFormat;
    public List<PluginModel> plugins = new ArrayList<PluginModel>();

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
        sb.append("pluginFormat=");
        sb.append(pluginFormat.toString());
        sb.append("dataFomrat=");
        sb.append(dataFormat.toString());
        sb.append("}");

        return sb.toString();
    }
}
