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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.TextDocumentManager;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubClientConfig;
import com.marklogic.hub.spark.sql.sources.v2.writer.HubDataWriterFactory;
import org.apache.commons.lang.StringUtils;
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
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.Properties;
import java.util.stream.Stream;

public class DefaultSource extends LoggingObject implements WriteSupport, StreamWriteSupport {

    @Override
    public Optional<DataSourceWriter> createWriter(String writeUUID, StructType schema, SaveMode mode, DataSourceOptions options) {
        return Optional.of(new HubDataSourceWriter(options.asMap(), schema, false) {
        });
    }

    @Override
    public StreamWriter createStreamWriter(String queryId, StructType schema, OutputMode mode, DataSourceOptions options) {
        return new HubDataSourceWriter(options.asMap(), schema, true);
    }

    public static HubClientConfig buildHubClientConfig(Map<String, String> options) {
        Properties props = new Properties();
        // Assume DHS usage by default; the options map can override these
        props.setProperty("hubdhs", "true");
        props.setProperty("hubssl", "true");
        options.keySet().forEach(key -> props.setProperty(key, options.get(key)));

        HubClientConfig hubClientConfig = new HubClientConfig();
        hubClientConfig.registerLowerCasedPropertyConsumers();
        hubClientConfig.applyProperties(props);
        return hubClientConfig;
    }
}

class HubDataSourceWriter extends LoggingObject implements StreamWriter {

    private Map<String, String> map;
    private StructType schema;
    private boolean streaming;
    private HubClient hubClient;
    private HubClientConfig hubClientConfig;
    private ObjectNode defaultWorkUnit;
    private JsonNode endpointParams;
    public final static ObjectMapper mapper = new ObjectMapper();

    public HubDataSourceWriter(Map<String, String> map, StructType schema, Boolean streaming) {
        this.map = map;
        this.schema = schema;
        this.streaming = streaming;

        this.hubClientConfig = DefaultSource.buildHubClientConfig(map);
        this.hubClient =  HubClient.withHubClientConfig(hubClientConfig);
        this.endpointParams = determineIngestionEndpointParams(map);
    }

    @Override
    public DataWriterFactory<InternalRow> createWriterFactory() {
        return new HubDataWriterFactory(map, this.schema, endpointParams);
    }

    @Override
    public void commit(long epochId, WriterCommitMessage[] messages) {
        // TODO : Implementation
    }

    @Override
    public void abort(long epochId, WriterCommitMessage[] messages) {
        logger.info("Abort, epoch: " + epochId + "; messages: " + Arrays.asList(messages));
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
        logger.info("Abort, messages: " + Arrays.asList(messages));
    }

    private JsonNode determineIngestionEndpointParams(Map<String, String> options) {
        ObjectMapper objectMapper = new ObjectMapper();

        ObjectNode endpointParams;
        if (options.containsKey("ingestendpointparams")) {
            try {
                endpointParams = (ObjectNode) objectMapper.readTree(options.get("ingestendpointparams"));
            } catch (IOException e) {
                throw new IllegalArgumentException("Unable to parse ingestendpointparams, cause: " + e.getMessage(), e);
            }
        } else {
            endpointParams = objectMapper.createObjectNode();
        }

        boolean doesNotHaveApiPath = (!endpointParams.hasNonNull("apiPath") || StringUtils.isEmpty(endpointParams.get("apiPath").asText()));
        boolean hasWorkUnitOrEndpointState = endpointParams.hasNonNull("workUnit") || endpointParams.hasNonNull("endpointState");
        if (doesNotHaveApiPath && hasWorkUnitOrEndpointState) {
            throw new IllegalArgumentException("Cannot set workUnit or endpointState in ingestionendpointparams unless apiPath is defined as well.");
        }

        if (doesNotHaveApiPath) {
            String apiPath = "/marklogic-data-hub-spark-connector/bulkIngester.api";

            if(hubClient.getModulesClient().newJSONDocumentManager().exists(apiPath) == null) {
                try {
                    loadEndpoints();
                } catch (IOException e) {
                    throw new RuntimeException("Unable to write default ingestion endpoint at path: " + apiPath + "; cause: " + e.getMessage(), e);
                }
            }

            endpointParams.put("apiPath", apiPath);
        }

        if (!endpointParams.hasNonNull("workUnit")) {
            defaultWorkUnit = objectMapper.createObjectNode();
            buildDefaultWorkUnit(options);
            endpointParams.set("workUnit", defaultWorkUnit);
        }

        return endpointParams;
    }

    private void buildDefaultWorkUnit(Map<String, String> options) {
        Stream.of("collections", "permissions", "sourcename", "sourcetype", "uriprefix").forEach(key -> {
            if (options.containsKey(key)) {
                defaultWorkUnit.put(key, options.get(key));
            }
        });
    }

    private void loadEndpoints() throws IOException {
        String scriptPath = "marklogic-data-hub-spark-connector/bulkIngester.sjs";
        String apiPath = "marklogic-data-hub-spark-connector/bulkIngester.api";

        TextDocumentManager modMgr = hubClient.getModulesClient().newTextDocumentManager();
        DocumentWriteSet writeSet = modMgr.newWriteSet();
        DocumentMetadataHandle metadata = buildDocumentMetadata();
        writeSet.add("/" + apiPath, metadata, new InputStreamHandle(new ClassPathResource(apiPath).getInputStream()).withFormat(Format.JSON));
        writeSet.add("/" + scriptPath, metadata, new InputStreamHandle(new ClassPathResource(scriptPath).getInputStream()).withFormat(Format.TEXT));
        modMgr.write(writeSet);
    }

    private DocumentMetadataHandle buildDocumentMetadata() {
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        String modulePermissions = hubClientConfig.getModulePermissions();
        new DefaultDocumentPermissionsParser().parsePermissions(modulePermissions, metadata.getPermissions());

        // It seems preferable to use this collection so that modules loaded by the connector are considered OOTB
        // modules. Otherwise, if the modules are not loaded in this collection, tasks like mlClearUserModules will
        // delete them, which does not seem expected.
        metadata.getCollections().addAll("hub-core-module");

        return metadata;
    }
}
