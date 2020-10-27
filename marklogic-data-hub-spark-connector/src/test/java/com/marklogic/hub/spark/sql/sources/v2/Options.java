package com.marklogic.hub.spark.sql.sources.v2;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.spark.sql.sources.v2.DataSourceOptions;

import java.util.HashMap;
import java.util.Map;

/**
 * Test class for encapsulating all the options that can be passed to our connector. Provides a simple interface for
 * setting each option and then producing a DataSourceOptions from this class.
 */
public class Options {

    private String uriPrefix;
    private String ingestApiPath;
    private String collections;
    private String permissions;
    private String sourceName;
    private String sourceType;
    private JsonNode ingestEndpointConstants;
    private JsonNode ingestEndpointState;
    private Map<String, String> hubProperties;

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

        if (ingestApiPath != null || ingestEndpointConstants != null || ingestEndpointState != null) {
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode node = mapper.createObjectNode();
            if (ingestApiPath != null) {
                node.put("apiPath", ingestApiPath);
            }
            if (ingestEndpointConstants != null) {
                node.set("endpointConstants", ingestEndpointConstants);
            }
            if (ingestEndpointState != null) {
                node.set("endpointState", ingestEndpointState);
            }
            params.put("ingestendpointparams", node.toString());
        }

        return new DataSourceOptions(params);
    }

    public Options withUriPrefix(String uriPrefix) {
        this.uriPrefix = uriPrefix;
        return this;
    }

    public Options withIngestApiPath(String ingestApiPath) {
        this.ingestApiPath = ingestApiPath;
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

    public Options withIngestEndpointConstants(JsonNode ingestEndpointConstants) {
        this.ingestEndpointConstants = ingestEndpointConstants;
        return this;
    }

    public Options withIngestEndpointState(JsonNode ingestEndpointState) {
        this.ingestEndpointState = ingestEndpointState;
        return this;
    }
}
