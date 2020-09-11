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

public class MarkLogicDataWriter implements DataWriter<InternalRow> {

    private List<String> records;
    private InputEndpoint.BulkInputCaller loader;
    private StructType schema;
    private int batchSize;

    public MarkLogicDataWriter(HubClient hubClient, long taskId, StructType schema, Map<String, String> params) {
        System.out.println("************ Reached MarkLogicDataWriter ****************");

        this.records = new ArrayList<>();
        this.schema = schema;
        this.batchSize = Integer.parseInt(params.get("batchsize"));
        String endpointState = "{\"next\":" + 0 + ", \"prefix\":\""+params.get("prefixvalue")+"\"}";
        this.loader = InputEndpoint.on(
            hubClient.getStagingClient(),
            hubClient.getModulesClient().newTextDocumentManager().read(params.get("apipath"), new StringHandle())
        ).bulkCaller();

        String workUnit = "{\"taskId\":" + taskId + "}";
        loader.setWorkUnit(new ByteArrayInputStream(workUnit.getBytes()));
        loader.setEndpointState(new ByteArrayInputStream(endpointState.getBytes()));
    }

    @Override
    public void write(InternalRow record) {
        System.out.println("************ Reached MarkLogicDataWriter.write **************** ");

        records.add(prepareData1(record));

        if(records.size() == this.batchSize) {
            writeRecords();
        }
    }

    @Override
    public WriterCommitMessage commit() {
        if(!this.records.isEmpty()) {
            writeRecords();
        }

        return null;
    }

    @Override
    public void abort() {
        throw new UnsupportedOperationException("Transaction cannot be aborted");
    }

    private void writeRecords() {
        System.out.println("************ Reached MarkLogicDataWriter.writeRecords ****************");

        Stream.Builder<InputStream> builder = Stream.builder();

        for(int i=0; i< records.size(); i++){
            builder.add(new ByteArrayInputStream(records.get(i).getBytes()));
        }
        Stream<InputStream> input = builder.build();
        input.forEach(loader::accept);
        loader.awaitCompletion();
        this.records.clear();
    }

    private String prepareData1(InternalRow record) {

        StringWriter jsonObjectWriter = new StringWriter();

        scala.collection.immutable.Map<String,String> emptyMap = scala.collection.immutable.Map$.MODULE$.empty();
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
