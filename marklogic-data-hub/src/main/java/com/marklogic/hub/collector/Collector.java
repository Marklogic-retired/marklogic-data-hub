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
package com.marklogic.hub.collector;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubDatabase;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.FlowType;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;
import java.util.Map;
import java.util.Properties;

public interface Collector {

    CodeFormat getCodeFormat();
    String getModule();

    void setHubConfig(HubConfig config);
    HubConfig getHubConfig();

    void setClient(DatabaseClient client);
    DatabaseClient getClient();

    DiskQueue<String> run(String jobId, String entity, String flow, int threadCount, Map<String, Object> options);
}
