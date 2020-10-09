package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

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
     * @return	an object for executing database operations
     */
    static ArtifactService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a ArtifactService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * The service declaration uses a custom implementation of the same service instead
     * of the default implementation of the service by specifying an endpoint directory
     * in the modules database with the implementation. A service.json file with the
     * declaration can be read with FileHandle or a string serialization of the JSON
     * declaration with StringHandle.
     *
     * @param db	provides a client for communicating with the database server
     * @param serviceDeclaration	substitutes a custom implementation of the service
     * @return	an object for executing database operations
     */
    static ArtifactService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class ArtifactServiceImpl implements ArtifactService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_getArtifactsWithProjectPaths;
            private BaseProxy.DBFunctionRequest req_setArtifact;
            private BaseProxy.DBFunctionRequest req_clearUserArtifacts;
            private BaseProxy.DBFunctionRequest req_getList;

            private ArtifactServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/artifacts/", servDecl);

                this.req_getArtifactsWithProjectPaths = this.baseProxy.request(
                    "getArtifactsWithProjectPaths.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_setArtifact = this.baseProxy.request(
                    "setArtifact.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
                this.req_clearUserArtifacts = this.baseProxy.request(
                    "clearUserArtifacts.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_getList = this.baseProxy.request(
                    "getList.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getArtifactsWithProjectPaths() {
                return getArtifactsWithProjectPaths(
                    this.req_getArtifactsWithProjectPaths.on(this.dbClient)
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getArtifactsWithProjectPaths(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request.responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode setArtifact(String artifactType, String artifactName, com.fasterxml.jackson.databind.JsonNode artifact) {
                return setArtifact(
                    this.req_setArtifact.on(this.dbClient), artifactType, artifactName, artifact
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode setArtifact(BaseProxy.DBFunctionRequest request, String artifactType, String artifactName, com.fasterxml.jackson.databind.JsonNode artifact) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("artifactType", false, BaseProxy.StringType.fromString(artifactType)),
                          BaseProxy.atomicParam("artifactName", false, BaseProxy.StringType.fromString(artifactName)),
                          BaseProxy.documentParam("artifact", false, BaseProxy.JsonDocumentType.fromJsonNode(artifact))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public void clearUserArtifacts() {
                clearUserArtifacts(
                    this.req_clearUserArtifacts.on(this.dbClient)
                    );
            }
            private void clearUserArtifacts(BaseProxy.DBFunctionRequest request) {
              request.responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getList(String artifactType) {
                return getList(
                    this.req_getList.on(this.dbClient), artifactType
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getList(BaseProxy.DBFunctionRequest request, String artifactType) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("artifactType", false, BaseProxy.StringType.fromString(artifactType))
                          ).responseSingle(false, Format.JSON)
                );
            }
        }

        return new ArtifactServiceImpl(db, serviceDeclaration);
    }

  /**
   * Returns a JSON array with an entry for each project artifact and its file path within a project
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getArtifactsWithProjectPaths();

  /**
   * Invokes the setArtifact operation on the database server
   *
   * @param artifactType	provides input
   * @param artifactName	provides input
   * @param artifact	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode setArtifact(String artifactType, String artifactName, com.fasterxml.jackson.databind.JsonNode artifact);

  /**
   * Invokes the clearUserArtifacts operation on the database server
   *
   * 
   * 
   */
    void clearUserArtifacts();

  /**
   * Invokes the getList operation on the database server
   *
   * @param artifactType	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getList(String artifactType);

}
