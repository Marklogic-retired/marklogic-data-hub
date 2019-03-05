/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.web.model;

import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;

import java.util.ArrayList;
import java.util.List;

public class FlowModel {

    public String entityName;
    public String flowName;
    public FlowType flowType;
    public CodeFormat codeFormat;
    public DataFormat dataFormat;
    public Boolean useEsModel;
    public String mappingName;
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
        sb.append("flowType=");
        sb.append(flowType.toString());
        sb.append("codeFormat=");
        sb.append(codeFormat.toString());
        sb.append("dataFormat=");
        sb.append(dataFormat.toString());
        sb.append("mappingName=");
        sb.append(mappingName);
        sb.append("}");

        return sb.toString();
    }
}
