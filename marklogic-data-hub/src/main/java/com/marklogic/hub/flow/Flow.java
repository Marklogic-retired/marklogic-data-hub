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
import com.marklogic.hub.main.MainPlugin;

import java.util.Properties;

public interface Flow {
    void setEntityName(String entityName);
    String getEntityName();
    void setName(String name);
    String getName();
    void setType(FlowType type);
    FlowType getType();
    void setDataFormat(DataFormat dataFormat);
    DataFormat getDataFormat();
    void setCodeFormat(CodeFormat codeFormat);
    CodeFormat getCodeFormat();

    String serialize();

    Properties toProperties();

    String getFlowDbPath();

    Collector getCollector();
    void setCollector(Collector collector);

    MainPlugin getMain();
    void setMain(MainPlugin main);
}
