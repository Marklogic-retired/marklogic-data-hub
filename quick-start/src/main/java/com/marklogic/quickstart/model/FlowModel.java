/*
 * Copyright 2012-2016 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
    public Boolean useEsModel;
    public List<PluginModel> plugins = new ArrayList<>();

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
