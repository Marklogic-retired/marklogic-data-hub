package com.marklogic.hub.spark.sql.sources.v2.writer;

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
import com.marklogic.hub.spark.sql.sources.v2.Util;
import org.apache.commons.lang.StringUtils;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.writer.DataWriterFactory;
import org.apache.spark.sql.sources.v2.writer.WriterCommitMessage;
import org.apache.spark.sql.sources.v2.writer.streaming.StreamWriter;
import org.apache.spark.sql.types.StructType;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.util.Map;
import java.util.stream.Stream;

public class HubDataSourceWriter extends LoggingObject implements StreamWriter {

    private final Map<String, String> options;
    private final StructType sparkSchema;
    private final boolean streaming;
    private final HubClient hubClient;
    private final HubClientConfig hubClientConfig;
    private final JsonNode endpointParams;
    private final String jobId;
    private final ObjectMapper objectMapper;
    private CustomWriteApiDefinitions customWriteApiDefinitions;

    public HubDataSourceWriter(Map<String, String> options, StructType schema, Boolean streaming) {
        this.options = options;
        this.sparkSchema = schema;
        this.streaming = streaming;
        this.objectMapper = new ObjectMapper();
        this.hubClientConfig = Util.buildHubClientConfig(options);
        this.hubClient = HubClient.withHubClientConfig(hubClientConfig);
        verifyUserIsAuthorized();
        validateUriTemplateIfPresent();
        this.endpointParams = determineWriteRecordsEndpointParams(options);

        this.customWriteApiDefinitions = readCustomJobApiDefinitions(options);
        if (customWriteApiDefinitions.getInitializeWriteApiDefinition() == null) {
            loadInitializeModulesIfNotPresent();
        }
        if (customWriteApiDefinitions.getFinalizeWriteApiDefinition() == null) {
            loadFinalizeModulesIfNotPresent();
        }

        this.jobId = initializeWrite(schema);
        addJobIdToEndpointConstants();
    }

    @Override
    public DataWriterFactory<InternalRow> createWriterFactory() {
        return new HubDataWriterFactory(options, this.sparkSchema, endpointParams);
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
        finalizeWrite(status);
    }

    @Override
    public void abort(WriterCommitMessage[] messages) {
        // Because an aborted job maps to a "canceled" DHF job, there's no use case yet for the messages
        logger.error("Aborting job");
        finalizeWrite("canceled");
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
     * Validate the URI template if present in the options.
     *
     * A valid URI template:
     * - Has no missing opening or closing curly brackets.
     * - Each token has >0 characters.
     * - Has no nested curcly brackets.
     */
    private void validateUriTemplateIfPresent() {
        String uriTemplate = options.get("uritemplate");
        if ( uriTemplate == null ) {
            return;
        }
        boolean inToken = false;
        int tokenSize = 0;
        char[] chars = uriTemplate.toCharArray();
        for ( char ch : chars ) {
            if ( ch == '}' ) {
                if ( !inToken ) {
                    throw new IllegalArgumentException(format("Invalid uritemplate: %s; closing brace found before opening brace", uriTemplate));
                }
                if ( tokenSize == 0 ) {
                    throw new IllegalArgumentException(format("Invalid uritemplate: %s; no column name within opening and closing brace", uriTemplate));
                }
                inToken = false;
            } else if ( ch == '{' ) {
                if ( inToken ) {
                    throw new IllegalArgumentException(format("Invalid uritemplate: %s; expected closing brace, but found opening brace", uriTemplate));
                }
                inToken = true;
                tokenSize = 0;
            } else {
                if (inToken) {
                    tokenSize++;
                }
            }
        }
        if ( inToken ) {
            throw new IllegalArgumentException(format("Invalid uritemplate: %s; opening brace without closing brace", uriTemplate));
        }
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

    private JsonNode determineWriteRecordsEndpointParams(Map<String, String> options) {
        ObjectNode endpointParams;
        if (options.containsKey("writerecordsendpointparams")) {
            try {
                endpointParams = (ObjectNode) objectMapper.readTree(options.get("writerecordsendpointparams"));
            } catch (IOException e) {
                throw new IllegalArgumentException("Unable to parse writerecordsendpointparams, cause: " + e.getMessage(), e);
            }
        } else {
            endpointParams = objectMapper.createObjectNode();
        }

        boolean doesNotHaveApiPath = (!endpointParams.hasNonNull("apiPath") || StringUtils.isEmpty(endpointParams.get("apiPath").asText()));
        boolean hasEndpointConstantsOrEndpointState = endpointParams.hasNonNull("endpointConstants") || endpointParams.hasNonNull("endpointState");
        if (doesNotHaveApiPath && hasEndpointConstantsOrEndpointState) {
            throw new IllegalArgumentException("Cannot set endpointConstants or endpointState in writerecordsendpointparams unless apiPath is defined as well.");
        }

        // Always load writeLib, as a custom endpoint may need it
        loadModuleIfNotPresent("/marklogic-data-hub-spark-connector/writeLib.sjs", Format.TEXT);

        if (doesNotHaveApiPath) {
            String apiPath = "/marklogic-data-hub-spark-connector/writeRecords.api";
            String scriptPath = "/marklogic-data-hub-spark-connector/writeRecords.sjs";
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
        Stream.of("collections", "permissions", "sourcename", "sourcetype", "uriprefix","uritemplate").forEach(key -> {
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

    private String initializeWrite(StructType schema) {
        ObjectNode externalMetadata = objectMapper.createObjectNode();
        try {
            if (options.get("additionalexternalmetadata") != null) {
                externalMetadata = (ObjectNode) objectMapper.readTree(options.get("additionalexternalmetadata"));
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Unable to parse additionalExternalMetadata option as a JSON object; " +
                "cause: " + e.getMessage(), e);
        }
        try {
            externalMetadata.set("sparkSchema", objectMapper.readTree(schema.json()));

        } catch (Exception e) {
            logger.warn("Unable to read Spark schema as a JSON object; cause: " + e.getMessage() + "; the schema will not " +
                "be persisted on the job document");
        }

        String jobId = SparkService.on(hubClient.getJobsClient(), customWriteApiDefinitions.getInitializeWriteApiDefinition()).initializeWrite(externalMetadata);
        logger.info("Initialized write; job ID: " + jobId);
        return jobId;
    }

    private CustomWriteApiDefinitions readCustomJobApiDefinitions(Map<String, String> options) {
        InputStreamHandle initializeDefinition = null;
        String key = "initializewriteapipath";
        if (options.containsKey(key)) {
            try {
                initializeDefinition = hubClient.getModulesClient().newDocumentManager().read(options.get(key), new InputStreamHandle());
            } catch (Exception ex) {
                throw new RuntimeException("Unable to read custom API module for initializing a job: " + options.get(key) + "; cause: " + ex.getMessage(), ex);
            }
        }

        InputStreamHandle finalizeDefinition = null;
        key = "finalizewriteapipath";
        if (options.containsKey(key)) {
            try {
                finalizeDefinition = hubClient.getModulesClient().newDocumentManager().read(options.get(key), new InputStreamHandle());
            } catch (Exception ex) {
                throw new RuntimeException("Unable to read custom API module for finalizing a job: " + options.get(key) + "; cause: " + ex.getMessage(), ex);
            }
        }

        return new CustomWriteApiDefinitions(initializeDefinition, finalizeDefinition);
    }

    private void loadInitializeModulesIfNotPresent() {
        loadModuleIfNotPresent("/marklogic-data-hub-spark-connector/initializeWrite.sjs", Format.TEXT);
        loadModuleIfNotPresent("/marklogic-data-hub-spark-connector/initializeWrite.api", Format.JSON);
    }

    private void loadFinalizeModulesIfNotPresent() {
        loadModuleIfNotPresent("/marklogic-data-hub-spark-connector/finalizeWrite.sjs", Format.TEXT);
        loadModuleIfNotPresent("/marklogic-data-hub-spark-connector/finalizeWrite.api", Format.JSON);
    }

    private void addJobIdToEndpointConstants() {
        if (endpointParams != null && endpointParams.has("endpointConstants")) {
            JsonNode endpointConstants = endpointParams.get("endpointConstants");
            if (endpointConstants instanceof ObjectNode) {
                ((ObjectNode) endpointConstants).put("jobId", this.jobId);
            }
        }
    }

    private void finalizeWrite(String status) {
        logger.info(format("Finalizing write; job ID: %s; status: %s", jobId, status));
        SparkService.on(hubClient.getJobsClient(), customWriteApiDefinitions.getFinalizeWriteApiDefinition()).finalizeWrite(jobId, status);
    }

    private boolean endpointExists(String scriptPath) {
        return !(hubClient.getModulesClient().newJSONDocumentManager().exists(scriptPath) == null);
    }
}

class CustomWriteApiDefinitions {

    private InputStreamHandle initializeWriteApiDefinition;
    private InputStreamHandle finalizeWriteApiDefinition;

    public CustomWriteApiDefinitions(InputStreamHandle initializeWriteApiDefinition, InputStreamHandle finalizeWriteApiDefinition) {
        this.initializeWriteApiDefinition = initializeWriteApiDefinition;
        this.finalizeWriteApiDefinition = finalizeWriteApiDefinition;
    }

    public InputStreamHandle getInitializeWriteApiDefinition() {
        return initializeWriteApiDefinition;
    }

    public InputStreamHandle getFinalizeWriteApiDefinition() {
        return finalizeWriteApiDefinition;
    }
}
