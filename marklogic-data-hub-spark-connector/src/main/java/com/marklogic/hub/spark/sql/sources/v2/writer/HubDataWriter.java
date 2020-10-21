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
import com.marklogic.client.dataservices.IOEndpoint;
import com.marklogic.client.dataservices.InputCaller;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.HubClient;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.catalyst.json.JSONOptions;
import org.apache.spark.sql.catalyst.json.JacksonGenerator;
import org.apache.spark.sql.catalyst.util.DateTimeUtils;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.apache.spark.sql.sources.v2.writer.WriterCommitMessage;
import org.apache.spark.sql.types.StructType;

import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class HubDataWriter extends LoggingObject implements DataWriter<InternalRow> {

    private List<String> records;
    private InputCaller.BulkInputCaller<String> loader;
    private StructType schema;
    private int batchSize;

    /**
     * @param hubClient
     * @param schema
     * @param options   contains all the options provided by Spark, which will include all connector-specific properties
     */
    public HubDataWriter(HubClient hubClient, StructType schema, Map<String, String> options, JsonNode endpointParams) {
        this.records = new ArrayList<>();
        this.schema = schema;
        this.batchSize = options.containsKey("batchsize") ? Integer.parseInt(options.get("batchsize")) : 100;

        final String apiPath = endpointParams.get("apiPath").asText();
        logger.info("Will write to endpoint defined by: " + apiPath);
        InputCaller<String> inputCaller = InputCaller.on(
            hubClient.getStagingClient(),
            hubClient.getModulesClient().newJSONDocumentManager().read(apiPath, new StringHandle()),
            new StringHandle().withFormat(Format.JSON)
        );

        IOEndpoint.CallContext callContext = inputCaller.newCallContext();
        if (endpointParams.hasNonNull("endpointState")) {
            callContext.withEndpointState(new JacksonHandle(endpointParams.get("endpointState")));
        }
        if (endpointParams.hasNonNull("endpointConstants")) {
            callContext.withEndpointConstants(new JacksonHandle(endpointParams.get("endpointConstants")));
        }
        this.loader = inputCaller.bulkCaller(callContext);
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
        logger.info("Abort");
    }

    private void writeRecords() {
        int recordCount = records.size();
        records.forEach(loader::accept);
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
}
