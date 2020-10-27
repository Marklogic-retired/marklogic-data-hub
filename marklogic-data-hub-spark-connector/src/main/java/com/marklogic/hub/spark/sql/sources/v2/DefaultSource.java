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
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentManager;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubClientConfig;
import com.marklogic.hub.spark.dataservices.SparkService;
import com.marklogic.hub.spark.sql.sources.v2.writer.AtLeastOneWriteFailedMessage;
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

    private final Map<String, String> options;
    private final StructType schema;
    private final boolean streaming;
    private final HubClient hubClient;
    private final HubClientConfig hubClientConfig;
    private final JsonNode endpointParams;
    private final String jobId;
    private final ObjectMapper objectMapper;
    private CustomJobApiDefinitions customJobApiDefinitions;

    public HubDataSourceWriter(Map<String, String> options, StructType schema, Boolean streaming) {
        this.options = options;
        this.schema = schema;
        this.streaming = streaming;
        this.objectMapper = new ObjectMapper();

        this.hubClientConfig = DefaultSource.buildHubClientConfig(options);
        this.hubClient = HubClient.withHubClientConfig(hubClientConfig);
        verifyUserIsAuthorized();

        this.endpointParams = determineIngestionEndpointParams(options);

        this.customJobApiDefinitions = readCustomJobApiDefinitions(options);
        if (customJobApiDefinitions.getInitializeJobApiDefinition() == null) {
            loadInitializeJobModulesIfNotPresent();
        }
        if (customJobApiDefinitions.getFinalizeJobApiDefinition() == null) {
            loadFinalizeJobModulesIfNotPresent();
        }

        this.jobId = initializeJob(schema);
        addJobIdToEndpointConstants();
    }

    @Override
    public DataWriterFactory<InternalRow> createWriterFactory() {
        return new HubDataWriterFactory(options, this.schema, endpointParams);
    }

    @Override
    public void commit(long epochId, WriterCommitMessage[] messages) {
        commit(messages);
    }

    @Override
    public void abort(long epochId, WriterCommitMessage[] messages) {
        abort(messages);
    }

    @Override
    public void commit(WriterCommitMessage[] messages) {
        String status = atLeastOneWriteFailed(messages) ? "finished_with_errors" : "finished";
        finalizeJob(status);
    }

    @Override
    public void abort(WriterCommitMessage[] messages) {
        // Because an aborted job maps to a "canceled" DHF job, there's no use case yet for the messages
        logger.error("Aborting job");
        finalizeJob("canceled");
    }

    private boolean atLeastOneWriteFailed(WriterCommitMessage[] messages) {
        if (messages != null) {
            for (WriterCommitMessage message : messages) {
                if (message instanceof AtLeastOneWriteFailedMessage) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Note that this is only verifying that the user is able to authorized to connect to MarkLogic. A later call made
     * by the connector to ML may fail because the call requires additional privileges that the user does not have.
     */
    private void verifyUserIsAuthorized() {
        DatabaseClient.ConnectionResult result = hubClient.getStagingClient().checkConnection();
        if (result.getStatusCode() == 401) {
            throw new RuntimeException("User is unauthorized; " +
                "please ensure you have the correct username and password for a MarkLogic user that has at least the data-hub-operator role");
        }
        logger.info("Created HubClient for host: " + hubClient.getStagingClient().getHost());
    }

    private JsonNode determineIngestionEndpointParams(Map<String, String> options) {
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
        boolean hasEndpointConstantsOrEndpointState = endpointParams.hasNonNull("endpointConstants") || endpointParams.hasNonNull("endpointState");
        if (doesNotHaveApiPath && hasEndpointConstantsOrEndpointState) {
            throw new IllegalArgumentException("Cannot set endpointConstants or endpointState in ingestionendpointparams unless apiPath is defined as well.");
        }

        if (doesNotHaveApiPath) {
            String apiPath = "/marklogic-data-hub-spark-connector/bulkIngester.api";
            String scriptPath = "/marklogic-data-hub-spark-connector/bulkIngester.sjs";
            loadModuleIfNotPresent(scriptPath, Format.TEXT);
            loadModuleIfNotPresent(apiPath, Format.JSON);


            endpointParams.put("apiPath", apiPath);
        }

        if (!endpointParams.hasNonNull("endpointConstants")) {
            ObjectNode endpointConstants = objectMapper.createObjectNode();
            applyOptionsToEndpointConstants(endpointConstants, options);
            endpointParams.set("endpointConstants", endpointConstants);
        }

        return endpointParams;
    }

    /**
     * Options that influence the default ingestion endpoint are copied to the endpoint constants object.
     *
     * @param endpointConstants
     * @param options
     */
    private void applyOptionsToEndpointConstants(ObjectNode endpointConstants, Map<String, String> options) {
        Stream.of("collections", "permissions", "sourcename", "sourcetype", "uriprefix").forEach(key -> {
            if (options.containsKey(key)) {
                endpointConstants.put(key, options.get(key));
            }
        });
    }

    private void loadModuleIfNotPresent(String modulePath, Format format) {
        if (!endpointExists(modulePath)) {
            try {
                DocumentManager modMgr = hubClient.getModulesClient().newDocumentManager();
                DocumentMetadataHandle metadata = buildDocumentMetadata();
                logger.info("Loading module: " + modulePath);
                modMgr.write(modulePath, metadata, new InputStreamHandle(new ClassPathResource(modulePath).getInputStream()).withFormat(format));
            } catch (IOException e) {
                throw new RuntimeException("Unable to write endpoint at path: " + modulePath + "; cause: " + e.getMessage(), e);
            }
        }
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

    private String initializeJob(StructType schema) {
        ObjectNode sparkMetadata = objectMapper.createObjectNode();
        try {
            sparkMetadata.set("schema", objectMapper.readTree(schema.json()));
        } catch (Exception e) {
            logger.warn("Unable to read Spark schema as a JSON object; cause: " + e.getMessage() + "; the schema will not " +
                "be persisted on the job document");
        }

        String jobId = SparkService.on(hubClient.getJobsClient(), customJobApiDefinitions.getInitializeJobApiDefinition()).initializeJob(sparkMetadata);
        logger.info("Initialized job; ID: " + jobId);
        return jobId;
    }

    private CustomJobApiDefinitions readCustomJobApiDefinitions(Map<String, String> options) {
        InputStreamHandle initializeDefinition = null;
        String key = "initializejobapipath";
        if (options.containsKey(key)) {
            try {
                initializeDefinition = hubClient.getModulesClient().newDocumentManager().read(options.get(key), new InputStreamHandle());
            } catch (Exception ex) {
                throw new RuntimeException("Unable to read custom API module for initializing a job: " + options.get(key) + "; cause: " + ex.getMessage(), ex);
            }
        }

        InputStreamHandle finalizeDefinition = null;
        key = "finalizejobapipath";
        if (options.containsKey(key)) {
            try {
                finalizeDefinition = hubClient.getModulesClient().newDocumentManager().read(options.get(key), new InputStreamHandle());
            } catch (Exception ex) {
                throw new RuntimeException("Unable to read custom API module for finalizing a job: " + options.get(key) + "; cause: " + ex.getMessage(), ex);
            }
        }

        return new CustomJobApiDefinitions(initializeDefinition, finalizeDefinition);
    }

    private void loadInitializeJobModulesIfNotPresent() {
        loadModuleIfNotPresent("/marklogic-data-hub-spark-connector/initializeJob.sjs", Format.TEXT);
        loadModuleIfNotPresent("/marklogic-data-hub-spark-connector/initializeJob.api", Format.JSON);
    }

    private void loadFinalizeJobModulesIfNotPresent() {
        loadModuleIfNotPresent("/marklogic-data-hub-spark-connector/finalizeJob.sjs", Format.TEXT);
        loadModuleIfNotPresent("/marklogic-data-hub-spark-connector/finalizeJob.api", Format.JSON);
    }

    private void addJobIdToEndpointConstants() {
        if (endpointParams != null && endpointParams.has("endpointConstants")) {
            JsonNode endpointConstants = endpointParams.get("endpointConstants");
            if (endpointConstants instanceof ObjectNode) {
                ((ObjectNode) endpointConstants).put("jobId", this.jobId);
            }
        }
    }

    private void finalizeJob(String status) {
        logger.info(format("Finalizing job; ID: %s; status: %s", jobId, status));
        SparkService.on(hubClient.getJobsClient(), customJobApiDefinitions.getFinalizeJobApiDefinition()).finalizeJob(jobId, status);
    }

    private boolean endpointExists(String scriptPath) {
        return !(hubClient.getModulesClient().newJSONDocumentManager().exists(scriptPath) == null);
    }
}

class CustomJobApiDefinitions {

    private InputStreamHandle initializeJobApiDefinition;
    private InputStreamHandle finalizeJobApiDefinition;

    public CustomJobApiDefinitions(InputStreamHandle initializeJobApiDefinition, InputStreamHandle finalizeJobApiDefinition) {
        this.initializeJobApiDefinition = initializeJobApiDefinition;
        this.finalizeJobApiDefinition = finalizeJobApiDefinition;
    }

    public InputStreamHandle getInitializeJobApiDefinition() {
        return initializeJobApiDefinition;
    }

    public InputStreamHandle getFinalizeJobApiDefinition() {
        return finalizeJobApiDefinition;
    }
}
