/*
 * Copyright 2020 MarkLogic Corporation
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
package com.marklogic.hub.spark.sql.sources.v2.writer;

import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.util.SimplePropertySource;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.apache.spark.sql.sources.v2.writer.DataWriterFactory;
import org.apache.spark.sql.types.StructType;

import java.util.Map;
import java.util.Properties;

public class HubDataWriterFactory extends LoggingObject implements DataWriterFactory<InternalRow> {

    private StructType schema;
    private HubClient hubClient;
    private Map<String, String> options;


    /**
     * @param options a map of options containing both DHF-supported properties (most likely prefixed with ml* or
     *               hub*) and connector-specific properties. The DHF-supported properties will be used to construct a
     *               HubClient for communicating with MarkLogic.
     * @param schema
     */
    public HubDataWriterFactory(Map<String, String> options, StructType schema) {
        this.options = options;
        this.schema = schema;
        HubConfigImpl hubConfig = buildHubConfig(options);
        logger.info("Creating HubClient for host: " + hubConfig.getHost());
        this.hubClient = hubConfig.newHubClient();
    }

    @Override
    public DataWriter<InternalRow> createDataWriter(int partitionId, long taskId, long epochId) {
        return new HubDataWriter(hubClient, schema, options);
    }

    /**
     * This is a static method so that it can be easily tested without instantiating this class.
     *
     * @param options
     * @return
     */
    protected static HubConfigImpl buildHubConfig(Map<String, String> options) {
        Properties props = new Properties();
        // Assume DHS usage by default; the options map can override these
        props.setProperty("hubdhs", "true");
        props.setProperty("hubssl", "true");
        options.keySet().forEach(key -> props.setProperty(key, options.get(key)));

        HubConfigImpl hubConfig = new HubConfigImpl();
        hubConfig.registerLowerCasedPropertyConsumers();
        hubConfig.applyProperties(new SimplePropertySource(props));
        return hubConfig;
    }
}
