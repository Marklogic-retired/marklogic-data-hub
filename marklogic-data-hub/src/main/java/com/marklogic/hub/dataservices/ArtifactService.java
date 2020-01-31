package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.impl.BaseProxy;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;

/**
 * Provides a set of operations on the database server
 */
public interface ArtifactService {
    /**
     * Creates a ArtifactService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for session state
     */
    static ArtifactService on(DatabaseClient db) {
        final class ArtifactServiceImpl implements ArtifactService {
            private BaseProxy baseProxy;

            private ArtifactServiceImpl(DatabaseClient dbClient) {
                baseProxy = new BaseProxy(dbClient, "/data-hub/5/data-services/artifacts/");
            }

            @Override
            public JsonNode getArtifactTypesInfo() {
                return BaseProxy.JsonDocumentType.toJsonNode(
                    baseProxy
                        .request("getArtifactTypesInfo.mjs", BaseProxy.ParameterValuesKind.NONE)
                        .withSession()
                        .withMethod("POST")
                        .responseSingle(false, Format.JSON)
                );
            }

            @Override
            public JsonNode getList(String artifactType) {
                return BaseProxy.JsonDocumentType.toJsonNode(
                    baseProxy
                        .request("getList.mjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC)
                        .withSession()
                        .withParams(
                            BaseProxy.atomicParam("artifactType", false, BaseProxy.StringType.fromString(artifactType)))
                        .withMethod("POST")
                        .responseSingle(false, Format.JSON)
                );
            }

            @Override
            public JsonNode getArtifact(String artifactType, String artifactName) {
                return BaseProxy.JsonDocumentType.toJsonNode(
                    baseProxy
                        .request("getArtifact.mjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS)
                        .withSession()
                        .withParams(
                            BaseProxy.atomicParam("artifactType", false, BaseProxy.StringType.fromString(artifactType)),
                            BaseProxy.atomicParam("artifactName", false, BaseProxy.StringType.fromString(artifactName))
                         )
                        .withMethod("POST")
                        .responseSingle(false, Format.JSON)
                );
            }

            @Override
            public JsonNode setArtifact(String artifactType, String artifactName, JsonNode artifact) {
                return BaseProxy.JsonDocumentType.toJsonNode(
                    baseProxy
                        .request("setArtifact.mjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED)
                        .withSession()
                        .withParams(
                            BaseProxy.atomicParam("artifactType", false, BaseProxy.StringType.fromString(artifactType)),
                            BaseProxy.atomicParam("artifactName", false, BaseProxy.StringType.fromString(artifactName)),
                            BaseProxy.documentParam("artifact", false, new JacksonHandle().with(artifact))
                        )
                        .withMethod("POST")
                        .responseSingle(false, Format.JSON)
                );
            }

            @Override
            public JsonNode deleteArtifact(String artifactType, String artifactName) {
                return BaseProxy.JsonDocumentType.toJsonNode(
                    baseProxy
                        .request("deleteArtifact.mjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS)
                        .withSession()
                        .withParams(
                            BaseProxy.atomicParam("artifactType", false, BaseProxy.StringType.fromString(artifactType)),
                            BaseProxy.atomicParam("artifactName", false, BaseProxy.StringType.fromString(artifactName))
                        )
                        .withMethod("POST")
                        .responseSingle(false, Format.JSON)
                );
            }

            @Override
            public JsonNode validateArtifact(String artifactType, String artifactName, JsonNode artifact) {
                return BaseProxy.JsonDocumentType.toJsonNode(
                    baseProxy
                        .request("validateArtifact.mjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC)
                        .withSession()
                        .withParams(
                            BaseProxy.atomicParam("artifactType", false, BaseProxy.StringType.fromString(artifactType)),
                            BaseProxy.atomicParam("artifactName", false, BaseProxy.StringType.fromString(artifactName)),
                            BaseProxy.documentParam("artifact", false, new JacksonHandle().with(artifact))
                        )
                        .withMethod("POST")
                        .responseSingle(false, Format.JSON)
                );
            }

            @Override
            public JsonNode getArtifactSettings(String artifactType, String artifactName) {
                return BaseProxy.JsonDocumentType.toJsonNode(
                    baseProxy
                        .request("getArtifactSettings.mjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS)
                        .withSession()
                        .withParams(
                            BaseProxy.atomicParam("artifactType", false, BaseProxy.StringType.fromString(artifactType)),
                            BaseProxy.atomicParam("artifactName", false, BaseProxy.StringType.fromString(artifactName))
                        )
                        .withMethod("POST")
                        .responseSingle(false, Format.JSON)
                );
            }

            @Override
            public JsonNode setArtifactSettings(String artifactType, String artifactName, JsonNode settings) {
                return BaseProxy.JsonDocumentType.toJsonNode(
                    baseProxy
                        .request("setArtifactSettings.mjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED)
                        .withSession()
                        .withParams(
                            BaseProxy.atomicParam("artifactType", false, BaseProxy.StringType.fromString(artifactType)),
                            BaseProxy.atomicParam("artifactName", false, BaseProxy.StringType.fromString(artifactName)),
                            BaseProxy.documentParam("settings", false, new JacksonHandle().with(settings))
                        )
                        .withMethod("POST")
                        .responseSingle(false, Format.JSON)
                );
            }

        }

        return new ArtifactServiceImpl(db);
    }

    /**
     * Invokes the getArtifactTypesInfo operation on the database server
     *
     * @return	as output
     */
    com.fasterxml.jackson.databind.JsonNode getArtifactTypesInfo();

    /**
     * Invokes the getList operation on the database server
     *
     * @param artifactType	provides input
     * @return	as output
     */
    com.fasterxml.jackson.databind.JsonNode getList(String artifactType);

    /**
     * Invokes the getArtifact operation on the database server
     *
     * @param artifactType	provides input
     * @param artifactName	provides input
     * @return	as output
     */
    com.fasterxml.jackson.databind.JsonNode getArtifact(String artifactType, String artifactName);

    /**
     * Invokes the setArtifact operation on the database server
     *
     * @param artifactType	provides input
     * @param artifactName	provides input
     * @param artifact	provides input
     * @return	as output
     */
    com.fasterxml.jackson.databind.JsonNode setArtifact(String artifactType, String artifactName, JsonNode artifact);

    /**
     * Invokes the deleteArtifact operation on the database server
     *
     * @param artifactType	provides input
     * @param artifactName	provides input
     * @return	as output
     */
    com.fasterxml.jackson.databind.JsonNode deleteArtifact(String artifactType, String artifactName);

    /**
     * Invokes the validateArtifact operation on the database server
     *
     * @param artifactType	provides input
     * @param artifactName	provides input
     * @param artifact	provides input
     * @return	as output
     */
    com.fasterxml.jackson.databind.JsonNode validateArtifact(String artifactType, String artifactName, JsonNode artifact);

    /**
     * Invokes the getArtifactSettings operation on the database server
     *
     * @param artifactType	provides input
     * @param artifactName	provides input
     * @return	as output
     */
    com.fasterxml.jackson.databind.JsonNode getArtifactSettings(String artifactType, String artifactName);

    /**
     * Invokes the setArtifactSettings operation on the database server
     *
     * @param artifactType	provides input
     * @param artifactName	provides input
     * @param settings	provides input
     * @return	as output
     */
    com.fasterxml.jackson.databind.JsonNode setArtifactSettings(String artifactType, String artifactName, JsonNode settings);
}
