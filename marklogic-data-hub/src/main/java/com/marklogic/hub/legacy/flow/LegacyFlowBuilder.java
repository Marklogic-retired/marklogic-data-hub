/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.legacy.flow;

import com.marklogic.hub.legacy.collector.LegacyCollector;
import com.marklogic.hub.legacy.collector.impl.LegacyCollectorImpl;
import com.marklogic.hub.legacy.flow.impl.LegacyFlowImpl;
import com.marklogic.hub.main.MainPlugin;
import com.marklogic.hub.main.impl.MainPluginImpl;

public class LegacyFlowBuilder {

    LegacyFlow flow;

    private LegacyFlowBuilder() {
        this.flow = new LegacyFlowImpl();
    }

    static public LegacyFlowBuilder newFlow() {
        return new LegacyFlowBuilder();
    }

    public LegacyFlowBuilder withName(String flowName) {
        flow.setName(flowName);
        return this;
    }

    public LegacyFlowBuilder withEntityName(String entityName) {
        flow.setEntityName(entityName);
        return this;
    }

    public LegacyFlowBuilder withType(FlowType type) {
        flow.setType(type);
        return this;
    }

    public LegacyFlowBuilder withDataFormat(DataFormat dataFormat) {
        flow.setDataFormat(dataFormat);
        return this;
    }

    public LegacyFlowBuilder withCodeFormat(CodeFormat codeFormat) {
        flow.setCodeFormat(codeFormat);
        return this;
    }

    public LegacyFlowBuilder withCollector(LegacyCollector legacyCollector) {
        flow.setCollector(legacyCollector);
        return this;
    }

    public LegacyFlowBuilder withMain(MainPlugin main) {
        flow.setMain(main);
        return this;
    }

    public LegacyFlowBuilder withMapping(String mappingName) {
        flow.setMappingName(mappingName);
        return this;
    }

    public LegacyFlow build() {

        if (flow.getCollector() == null && flow.getType().equals(FlowType.HARMONIZE)) {
            String collectorModule = "collector." + flow.getCodeFormat().toString();
            flow.setCollector(new LegacyCollectorImpl(collectorModule, flow.getCodeFormat()));
        }

        if (flow.getMain() == null) {
            String mainModule =  "main." + flow.getCodeFormat().toString();
            flow.setMain(new MainPluginImpl(mainModule, flow.getCodeFormat()));
        }
        return flow;
    }
}
