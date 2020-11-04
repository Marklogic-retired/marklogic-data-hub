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

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.spark.sql.sources.v2.DefaultSource;
import com.marklogic.hub.spark.sql.sources.v2.Util;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.apache.spark.sql.sources.v2.writer.DataWriterFactory;
import org.apache.spark.sql.types.StructType;

import java.util.Map;

public class HubDataWriterFactory extends LoggingObject implements DataWriterFactory<InternalRow> {

    private StructType sparkSchema;
    private Map<String, String> options;
    private JsonNode endpointParams;

    /**
     * @param options a map of options containing both DHF-supported properties (most likely prefixed with ml* or
     *                hub*) and connector-specific properties. The DHF-supported properties will be used to construct a
     *                HubClient for communicating with MarkLogic.
     * @param schema
     */
    public HubDataWriterFactory(Map<String, String> options, StructType schema, JsonNode endpointParams) {
        this.options = options;
        this.sparkSchema = schema;
        this.endpointParams = endpointParams;
    }

    @Override
    public DataWriter<InternalRow> createDataWriter(int partitionId, long taskId, long epochId) {
        HubClient client = HubClient.withHubClientConfig(Util.buildHubClientConfig(options));
        return new HubDataWriter(client, sparkSchema, options, endpointParams);
    }
}
