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
package com.marklogic.hub.flow;

import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.impl.CollectorImpl;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.main.MainPlugin;
import com.marklogic.hub.main.impl.MainPluginImpl;

public class FlowBuilder {

    Flow flow;

    private FlowBuilder() {
        this.flow = new FlowImpl();
    }

    static public FlowBuilder newFlow() {
        return new FlowBuilder();
    }

    public FlowBuilder withName(String flowName) {
        flow.setName(flowName);
        return this;
    }

    public FlowBuilder withEntityName(String entityName) {
        flow.setEntityName(entityName);
        return this;
    }

    public FlowBuilder withType(FlowType type) {
        flow.setType(type);
        return this;
    }

    public FlowBuilder withDataFormat(DataFormat dataFormat) {
        flow.setDataFormat(dataFormat);
        return this;
    }

    public FlowBuilder withCodeFormat(CodeFormat codeFormat) {
        flow.setCodeFormat(codeFormat);
        return this;
    }

    public FlowBuilder withCollector(Collector collector) {
        flow.setCollector(collector);
        return this;
    }

    public FlowBuilder withMain(MainPlugin main) {
        flow.setMain(main);
        return this;
    }

    public Flow build() {

        if (flow.getCollector() == null && flow.getType().equals(FlowType.HARMONIZE)) {
            String collectorModule = "collector." + flow.getCodeFormat().toString();
            flow.setCollector(new CollectorImpl(collectorModule, flow.getCodeFormat()));
        }

        if (flow.getMain() == null) {
            String mainModule =  "main." + flow.getCodeFormat().toString();
            flow.setMain(new MainPluginImpl(mainModule, flow.getCodeFormat()));
        }
        return flow;
    }
}
