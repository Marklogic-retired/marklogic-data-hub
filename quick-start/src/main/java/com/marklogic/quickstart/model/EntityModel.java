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

import com.marklogic.hub.plugin.PluginFormat;

import java.util.List;

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
