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

import java.util.List;

import com.marklogic.client.io.Format;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.plugin.Plugin;
import com.marklogic.hub.writer.Writer;

public interface Flow {
    String getEntityName();
    String getName();
    FlowType getType();
    Format getDataFormat();
    String serialize(boolean full);

    Collector getCollector();
    void setCollector(Collector collector);

    void addPlugin(Plugin plugin);

    // make this immutable
    List<Plugin> getPlugins();

    void setWriter(Writer writer);
    Writer getWriter();
}
