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

import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.apache.spark.sql.sources.v2.writer.DataWriterFactory;
import org.apache.spark.sql.types.StructType;

import java.util.HashMap;
import java.util.Map;

public class MarkLogicDataWriterFactory implements DataWriterFactory<InternalRow> {
    private Map<String, String> map;
    private StructType schema;
    public MarkLogicDataWriterFactory(Map<String, String> map, StructType schema) {
        this.map = map;
        this.schema = schema;
    }

    @Override
    public DataWriter<InternalRow> createDataWriter(int partitionId, long taskId, long epochId) {
        System.out.println("************** task id ************** "+ taskId);

        Map<String, String> mapConfig = new HashMap<>();
        mapConfig.putAll(map);
        mapConfig.put("taskId",String.valueOf(taskId));
       // MarkLogicSparkWriteDriver.taskIds.add(taskId);

        return new MarkLogicDataWriter(mapConfig, this.schema);
    }
}
