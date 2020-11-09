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
import com.marklogic.hub.spark.sql.sources.v2.reader.HubDataSourceReader;
import com.marklogic.hub.spark.sql.sources.v2.writer.HubDataSourceWriter;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.sources.v2.DataSourceOptions;
import org.apache.spark.sql.sources.v2.ReadSupport;
import org.apache.spark.sql.sources.v2.StreamWriteSupport;
import org.apache.spark.sql.sources.v2.WriteSupport;
import org.apache.spark.sql.sources.v2.reader.DataSourceReader;
import org.apache.spark.sql.sources.v2.writer.DataSourceWriter;
import org.apache.spark.sql.sources.v2.writer.streaming.StreamWriter;
import org.apache.spark.sql.streaming.OutputMode;
import org.apache.spark.sql.types.StructType;

import java.util.Optional;

public class DefaultSource extends LoggingObject implements WriteSupport, StreamWriteSupport, ReadSupport {

    private HubDataSourceReader hubDataSourceReader;

    public DefaultSource() {
        logger.debug("Created: " + toString());
    }

    @Override
    public Optional<DataSourceWriter> createWriter(String writeUUID, StructType schema, SaveMode mode, DataSourceOptions options) {
        return Optional.of(new HubDataSourceWriter(options.asMap(), schema, false));
    }

    @Override
    public StreamWriter createStreamWriter(String queryId, StructType schema, OutputMode mode, DataSourceOptions options) {
        return new HubDataSourceWriter(options.asMap(), schema, true);
    }

    @Override
    public DataSourceReader createReader(DataSourceOptions options) {
        // Logging of the HubDataSourceReader's constructor indicates that in a simple Spark test program, this method
        // is called multiple times. On the first occasion, the getSchema method is called, and then instance is seemingly
        // discarded. On the second occasion, the planInputPartitions method is called, which allows for partition
        // readers to then be created. And then this is called on a third occasion for unknown reasons. For performance
        // reasons then, this class will only create one HubDataSourceReader. Testing has shown that if the Spark
        // program then calls "format" again on a SQLContext, a new instance of this class - DefaultSource - will be
        // created, thus ensuring that a new data source reader is created.
        if (hubDataSourceReader == null) {
            hubDataSourceReader = new HubDataSourceReader(options);
        }
        return hubDataSourceReader;
    }
}
