package com.marklogic.hub.spark.sql.sources.v2;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.spark.sql.sources.v2.DataSourceOptions;

import java.util.HashMap;
import java.util.Map;

/**
 * Test class for encapsulating all the options that can be passed to our connector. Provides a simple interface for
 * setting each option and then producing a DataSourceOptions from this class.
 */
public class Options {

    // All connector-specific options
    private String uriTemplate;
    private String uriPrefix;
    private String collections;
    private String permissions;
    private String sourceName;
    private String sourceType;
    private ObjectNode writerecordsendpointparams;
    private String initializeWriteApiPath;
    private String finalizeWriteApiPath;
    private JsonNode additionalExternalMetadata;
    private String initializeReadApiPath;

    // Can contain any DHF properties - e.g. mlHost, mlUsername, etc
    private Map<String, String> hubProperties;

    // Not an option, but rather used for testing an invalid JSON object
    private String additionalExternalMetadataAsString;

    // Read options
    private String view;
    private String schema;
    private String sqlCondition;
    private String selectedColumns;
    private String serializedPlan;
    private String sparkSchema;
    private ObjectNode readrowsendpointparams;

    // Has a default value so that tests don't depend on a Spark cluster running to determine minDefaultPartitions
    private String numPartitions = "2";

    public Options() {
    }

    public Options(Map<String, String> hubProperties) {
        this.hubProperties = hubProperties;
    }

    public DataSourceOptions toDataSourceOptions() {
        Map<String, String> params = new HashMap<>();
        if (hubProperties != null) {
            params.putAll(hubProperties);
        }
        if (uriTemplate != null) {
            params.put("uritemplate", uriTemplate);
        }

        if (uriPrefix != null) {
            params.put("uriprefix", uriPrefix);
        }

        if (collections != null) {
            params.put("collections", collections);
        }

        if (permissions != null) {
            params.put("permissions", permissions);
        }

        if (sourceName != null) {
            params.put("sourceName", sourceName);
        }

        if (sourceType != null) {
            params.put("sourceType", sourceType);
        }

        if(writerecordsendpointparams != null) {
            params.put("writerecordsendpointparams", writerecordsendpointparams.toString());
        }

        if (initializeWriteApiPath != null) {
            params.put("initializewriteapipath", initializeWriteApiPath);
        }
        if (finalizeWriteApiPath != null) {
            params.put("finalizewriteapipath", finalizeWriteApiPath);
        }

        if (additionalExternalMetadata != null) {
            params.put("additionalexternalmetadata", additionalExternalMetadata.toString());
        }
        if (additionalExternalMetadataAsString != null) {
            params.put("additionalexternalmetadata", additionalExternalMetadataAsString);
        }

        if (view != null) {
            params.put("view", view);
        }
        if (schema != null) {
            params.put("schema", schema);
        }
        if (sqlCondition != null) {
            params.put("sqlcondition", sqlCondition);
        }
        if (serializedPlan != null) {
            params.put("serializedplan", serializedPlan);
        }
        if (selectedColumns != null) {
            params.put("selectedcolumns", selectedColumns);
        }
        if (sparkSchema != null) {
            params.put("sparkschema", sparkSchema);
        }
        if(initializeReadApiPath != null) {
            params.put("initializereadapipath", initializeReadApiPath);
        }

        if(readrowsendpointparams !=null) {
            params.put("readrowsendpointparams", readrowsendpointparams.toString());
        }

        params.put("numpartitions", numPartitions);

        return new DataSourceOptions(params);
    }

    public Options withUriTemplate(String uriTemplate) {
        this.uriTemplate = uriTemplate;
        return this;
    }

    public Options withUriPrefix(String uriPrefix) {
        this.uriPrefix = uriPrefix;
        return this;
    }

    public Options withCollections(String collections) {
        this.collections = collections;
        return this;
    }

    public Options withPermissions(String permissions) {
        this.permissions = permissions;
        return this;
    }

    public Options withSourceName(String sourceName) {
        this.sourceName = sourceName;
        return this;
    }

    public Options withSourceType(String sourceType) {
        this.sourceType = sourceType;
        return this;
    }

    public Options withInitializeWriteApiPath(String initializeWriteApiPath) {
        this.initializeWriteApiPath = initializeWriteApiPath;
        return this;
    }

    public Options withFinalizeWriteApiPath(String finalizeWriteApiPath) {
        this.finalizeWriteApiPath = finalizeWriteApiPath;
        return this;
    }

    public Options withAdditionalExternalMetadata(JsonNode additionalExternalMetadata) {
        this.additionalExternalMetadata = additionalExternalMetadata;
        return this;
    }

    public Options withAdditionalExternalMetadataAsString(String additionalExternalMetadataAsString) {
        this.additionalExternalMetadataAsString = additionalExternalMetadataAsString;
        return this;
    }

    public Options withView(String view) {
        this.view = view;
        return this;
    }

    public Options withSchema(String schema) {
        this.schema = schema;
        return this;
    }

    public Options withSqlCondition(String sqlCondition) {
        this.sqlCondition = sqlCondition;
        return this;
    }

    public Options withSerializedPlan(String serializedPlan) {
        this.serializedPlan = serializedPlan;
        return this;
    }

    public Options withSelectedColumns(String columns) {
        this.selectedColumns = columns;
        return this;
    }

    public Options withNumPartitions(String numPartitions) {
        this.numPartitions = numPartitions;
        return this;
    }

    public Options withSparkSchema(String sparkSchema) {
        this.sparkSchema = sparkSchema;
        return this;
    }

    public Options withInitializeReadApiPath(String initializeReadApiPath) {
        this.initializeReadApiPath = initializeReadApiPath;
        return this;
    }

    public Options withReadRowsEndpointparams(ObjectNode readrowsendpointparams) {
        this.readrowsendpointparams = readrowsendpointparams;
        return this;
    }

    public Options withWriteRecordsEndpointparams(ObjectNode writerecordsendpointparams) {
        this.writerecordsendpointparams = writerecordsendpointparams;
        return this;
    }
}
