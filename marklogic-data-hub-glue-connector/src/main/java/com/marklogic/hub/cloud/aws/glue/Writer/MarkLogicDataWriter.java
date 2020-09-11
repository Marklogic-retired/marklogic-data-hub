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
package com.marklogic.hub.cloud.aws.glue.Writer;

import com.marklogic.client.dataservices.InputEndpoint;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.HubClient;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.catalyst.json.JSONOptions;
import org.apache.spark.sql.catalyst.json.JacksonGenerator;
import org.apache.spark.sql.catalyst.util.DateTimeUtils;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.apache.spark.sql.sources.v2.writer.WriterCommitMessage;
import org.apache.spark.sql.types.StructType;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

public class MarkLogicDataWriter extends LoggingObject implements DataWriter<InternalRow> {

    private List<String> records;
    private InputEndpoint.BulkInputCaller loader;
    private StructType schema;
    private int batchSize;

    /**
     *
     * @param hubClient
     * @param taskId
     * @param schema
     * @param params contains all the params provided by Spark, which will include all connector-specific properties
     */
    public MarkLogicDataWriter(HubClient hubClient, long taskId, StructType schema, Map<String, String> params) {
        this.records = new ArrayList<>();
        this.schema = schema;
        this.batchSize = params.containsKey("batchsize") ? Integer.parseInt(params.get("batchsize")) : 100;

        final String apiModulePath = params.containsKey("apipath") ? params.get("apipath") : "/data-hub/5/data-services/ingestion/bulkIngester.api";
        logger.info("Will write to endpoint defined by: " + apiModulePath);
        this.loader = InputEndpoint.on(
            hubClient.getStagingClient(),
            hubClient.getModulesClient().newTextDocumentManager().read(apiModulePath, new StringHandle())
        ).bulkCaller();

        loader.setWorkUnit(new ByteArrayInputStream(("{\"taskId\":" + taskId + "}").getBytes()));
        loader.setEndpointState(new ByteArrayInputStream(("{\"next\":" + 0 + ", \"prefix\":\"" + params.get("prefix") + "\"}").getBytes()));
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

}
