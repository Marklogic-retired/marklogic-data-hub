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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.dataservices.InputEndpoint;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.HubClient;
import org.apache.commons.lang.StringUtils;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.catalyst.json.JSONOptions;
import org.apache.spark.sql.catalyst.json.JacksonGenerator;
import org.apache.spark.sql.catalyst.util.DateTimeUtils;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.apache.spark.sql.sources.v2.writer.WriterCommitMessage;
import org.apache.spark.sql.types.StructType;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

public class HubDataWriter extends LoggingObject implements DataWriter<InternalRow> {

    private List<String> records;
    private InputEndpoint.BulkInputCaller loader;
    private StructType schema;
    private int batchSize;
    private ObjectNode defaultWorkUnit;

    /**
     * @param hubClient
     * @param schema
     * @param options    contains all the options provided by Spark, which will include all connector-specific properties
     */
    public HubDataWriter(HubClient hubClient, StructType schema, Map<String, String> options) {
        this.records = new ArrayList<>();
        this.schema = schema;
        this.batchSize = options.containsKey("batchsize") ? Integer.parseInt(options.get("batchsize")) : 100;

        JsonNode endpointParams = determineIngestionEndpointParams(options);

        final String apiPath = endpointParams.get("apiPath").asText();
        logger.info("Will write to endpoint defined by: " + apiPath);
        this.loader = InputEndpoint.on(
            hubClient.getStagingClient(),
            hubClient.getModulesClient().newJSONDocumentManager().read(apiPath, new StringHandle())
        ).bulkCaller();

        this.loader.setEndpointState(new JacksonHandle(endpointParams.get("endpointState")));
        this.loader.setWorkUnit(new JacksonHandle(endpointParams.get("workUnit")));
    }

    @Override
    public void write(InternalRow record) {
        records.add(convertRowToJSONString(record));
        if (records.size() == batchSize) {
            logger.debug("Writing records as batch size of " + batchSize + " has been reached");
            writeRecords();
        }
    }

    @Override
    public WriterCommitMessage commit() {
        if (!this.records.isEmpty()) {
            logger.debug("Writing records on commit");
            writeRecords();
        }
        return null;
    }

    @Override
    public void abort() {
        throw new UnsupportedOperationException("Transaction cannot be aborted");
    }

    private void writeRecords() {
        int recordCount = records.size();
        Stream.Builder<InputStream> builder = Stream.builder();
        for (int i = 0; i < recordCount; i++) {
            builder.add(new ByteArrayInputStream(records.get(i).getBytes()));
        }
        Stream<InputStream> input = builder.build();
        input.forEach(loader::accept);
        loader.awaitCompletion();
        logger.debug("Wrote records, count: " + recordCount);
        this.records.clear();
    }

    private String convertRowToJSONString(InternalRow record) {
        StringWriter jsonObjectWriter = new StringWriter();
        scala.collection.immutable.Map<String, String> emptyMap = scala.collection.immutable.Map$.MODULE$.empty();
        JacksonGenerator jacksonGenerator = new JacksonGenerator(
            schema,
            jsonObjectWriter,
            new JSONOptions(emptyMap, DateTimeUtils.TimeZoneUTC().getID(), "")
        );
        jacksonGenerator.write(record);
        jacksonGenerator.flush();
        return jsonObjectWriter.toString();
    }

    protected JsonNode determineIngestionEndpointParams(Map<String, String> options) {
        ObjectMapper objectMapper = new ObjectMapper();

        ObjectNode endpointParams;
        if (options.containsKey("ingestendpointparams")) {
            try {
                endpointParams = (ObjectNode) objectMapper.readTree(options.get("ingestendpointparams"));
            } catch (IOException e) {
                throw new RuntimeException("Unable to parse ingestendpointparams, cause: " + e.getMessage(), e);
            }
        } else {
            endpointParams = objectMapper.createObjectNode();
        }

        boolean doesNotHaveApiPath = (!endpointParams.hasNonNull("apiPath") || StringUtils.isEmpty(endpointParams.get("apiPath").asText()));
        boolean hasWorkUnitOrEndpointState = endpointParams.has("workUnit") || endpointParams.has("endpointState");
        if (doesNotHaveApiPath && hasWorkUnitOrEndpointState) {
            throw new RuntimeException("Cannot set workUnit or endpointState in ingestionendpointparams unless apiPath is defined as well.");
        }

        if (doesNotHaveApiPath) {
            endpointParams.put("apiPath", "/data-hub/5/data-services/ingestion/bulkIngester.api");
        }

        // TODO : remove the below else block after java-client-api 5.3 release
        if (!endpointParams.hasNonNull("endpointState")) {
            endpointParams.set("endpointState", objectMapper.createObjectNode());
        }

        if (!endpointParams.hasNonNull("workUnit")) {
            defaultWorkUnit = objectMapper.createObjectNode();
            buildDefaultWorkUnit(options);
            endpointParams.set("workUnit", defaultWorkUnit);
        }

        return endpointParams;
    }

    protected void buildDefaultWorkUnit(Map<String, String> options) {
        Stream.of("collections", "permissions", "sourcename", "sourcetype", "uriprefix").forEach(key -> {
            if (options.containsKey(key)) {
                defaultWorkUnit.put(key, options.get(key));
            }
        });
    }
}
