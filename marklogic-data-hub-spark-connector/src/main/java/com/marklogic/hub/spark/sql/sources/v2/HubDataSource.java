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
package com.marklogic.hub.spark.sql.sources.v2;

import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.spark.sql.sources.v2.writer.HubDataWriterFactory;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.DataSourceOptions;
import org.apache.spark.sql.sources.v2.StreamWriteSupport;
import org.apache.spark.sql.sources.v2.WriteSupport;
import org.apache.spark.sql.sources.v2.writer.DataSourceWriter;
import org.apache.spark.sql.sources.v2.writer.DataWriterFactory;
import org.apache.spark.sql.sources.v2.writer.WriterCommitMessage;
import org.apache.spark.sql.sources.v2.writer.streaming.StreamWriter;
import org.apache.spark.sql.streaming.OutputMode;
import org.apache.spark.sql.types.StructType;

import java.util.Map;
import java.util.Optional;

public class HubDataSource extends LoggingObject implements WriteSupport, StreamWriteSupport {

    @Override
    public Optional<DataSourceWriter> createWriter(String writeUUID, StructType schema, SaveMode mode, DataSourceOptions options) {
        logger.info("Creating HubDataSourceWriter");
        return Optional.of(new HubDataSourceWriter(options.asMap(), schema, false){

        });
    }

    @Override
    public StreamWriter createStreamWriter(String queryId, StructType schema, OutputMode mode, DataSourceOptions options) {
        logger.info("Creating HubStreamSourceWriter");
        return new HubDataSourceWriter(options.asMap(), schema, true);
    }
}
class HubDataSourceWriter implements StreamWriter {
    private Map<String, String> map;
    private StructType schema;
    private boolean streaming;

    public HubDataSourceWriter(Map<String, String> map, StructType schema, Boolean streaming) {
        this.map = map;
        this.schema = schema;
        this.streaming = streaming;
    }
    @Override
    public DataWriterFactory<InternalRow> createWriterFactory() {
        return new HubDataWriterFactory(map, this.schema);
    }

    @Override
    public void commit(long epochId, WriterCommitMessage[] messages) {
        // TODO : Implementation
    }

    @Override
    public void abort(long epochId, WriterCommitMessage[] messages) {
        throw new UnsupportedOperationException("Transaction cannot be aborted.");
    }

    @Override
    public void commit(WriterCommitMessage[] messages) {
        if (streaming) {
            throw new UnsupportedOperationException("Commit without epoch should not be called with StreamWriter");
        }
        // TODO : Implementation
    }

    @Override
    public void abort(WriterCommitMessage[] messages) {
        if (streaming) {
            throw new UnsupportedOperationException("Abort without epoch should not be called with StreamWriter");
        }
        throw new UnsupportedOperationException("Transaction cannot be aborted.");
    }
}
