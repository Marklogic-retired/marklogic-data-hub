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
import java.util.Map;

public class HubDataWriter extends LoggingObject implements DataWriter<InternalRow> {

    private InputCaller.BulkInputCaller<String> bulkInputCaller;
    private StructType sparkSchema;

    private Throwable writeException;

    /**
     * @param hubClient
     * @param schema
     * @param options        contains all the options provided by Spark, which will include all connector-specific properties
     * @param endpointParams
     */
    public HubDataWriter(HubClient hubClient, StructType schema, Map<String, String> options, JsonNode endpointParams) {
        this.sparkSchema = schema;

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
        this.bulkInputCaller = inputCaller.bulkCaller(callContext);
        configureErrorListenerOnBulkInputCaller();
    }

    @Override
    public void write(InternalRow record) {
        bulkInputCaller.accept(convertRowToJSONString(record));
    }

    @Override
    public WriterCommitMessage commit() {
        logger.info("Committing; awaiting completion of all writes");
        bulkInputCaller.awaitCompletion();
        if (writeException != null) {
            logger.info("At least one write failed");
            return new AtLeastOneWriteFailedMessage();
        }
        return null;
    }

    /**
     * The most likely reason for this to be called is due to an uncaught exception from the write() method.
     */
    @Override
    public void abort() {
        logger.info("Abort called, so interrupting BulkInputCaller");
        try {
            bulkInputCaller.interrupt();
            logger.info("Finished interrupting BulkInputCaller");
        } catch (Exception ex) {
            logger.warn("Unexpected error while interrupting BulkInputCaller: " + ex.getMessage(), ex);
        }
    }

    private void configureErrorListenerOnBulkInputCaller() {
        this.bulkInputCaller.setErrorListener((retryCount, throwable, callContext1, input) -> {
            if (this.writeException == null) {
                this.writeException = throwable;
            }
            logger.error("Skipping failed write; cause: " + throwable.getMessage());
            return IOEndpoint.BulkIOEndpointCaller.ErrorDisposition.SKIP_CALL;
        });
    }

    private String convertRowToJSONString(InternalRow record) {
        StringWriter jsonObjectWriter = new StringWriter();
        scala.collection.immutable.Map<String, String> emptyMap = scala.collection.immutable.Map$.MODULE$.empty();
        JacksonGenerator jacksonGenerator = new JacksonGenerator(
            sparkSchema,
            jsonObjectWriter,
            new JSONOptions(emptyMap, DateTimeUtils.TimeZoneUTC().getID(), "")
        );
        jacksonGenerator.write(record);
        jacksonGenerator.flush();
        return jsonObjectWriter.toString();
    }
}
