package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;
import java.io.InputStream;


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

            private BaseProxy.DBFunctionRequest req_setArtifact;
            private BaseProxy.DBFunctionRequest req_getArtifactTypesInfo;
            private BaseProxy.DBFunctionRequest req_deleteArtifact;
            private BaseProxy.DBFunctionRequest req_downloadConfigurationFiles;
            private BaseProxy.DBFunctionRequest req_validateArtifact;
            private BaseProxy.DBFunctionRequest req_getList;
            private BaseProxy.DBFunctionRequest req_getArtifact;

            private ArtifactServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/artifacts/", servDecl);

                this.req_setArtifact = this.baseProxy.request(
                    "setArtifact.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
                this.req_getArtifactTypesInfo = this.baseProxy.request(
                    "getArtifactTypesInfo.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_deleteArtifact = this.baseProxy.request(
                    "deleteArtifact.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_downloadConfigurationFiles = this.baseProxy.request(
                    "downloadConfigurationFiles.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_validateArtifact = this.baseProxy.request(
                    "validateArtifact.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
                this.req_getList = this.baseProxy.request(
                    "getList.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_getArtifact = this.baseProxy.request(
                    "getArtifact.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
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
            public com.fasterxml.jackson.databind.JsonNode getArtifactTypesInfo() {
                return getArtifactTypesInfo(
                    this.req_getArtifactTypesInfo.on(this.dbClient)
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getArtifactTypesInfo(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request.responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode deleteArtifact(String artifactType, String artifactName) {
                return deleteArtifact(
                    this.req_deleteArtifact.on(this.dbClient), artifactType, artifactName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode deleteArtifact(BaseProxy.DBFunctionRequest request, String artifactType, String artifactName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("artifactType", false, BaseProxy.StringType.fromString(artifactType)),
                          BaseProxy.atomicParam("artifactName", false, BaseProxy.StringType.fromString(artifactName))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public InputStream downloadConfigurationFiles() {
                return downloadConfigurationFiles(
                    this.req_downloadConfigurationFiles.on(this.dbClient)
                    );
            }
            private InputStream downloadConfigurationFiles(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.BinaryDocumentType.toInputStream(
                request.responseSingle(false, Format.BINARY)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode validateArtifact(String artifactType, String artifactName, com.fasterxml.jackson.databind.JsonNode artifact) {
                return validateArtifact(
                    this.req_validateArtifact.on(this.dbClient), artifactType, artifactName, artifact
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode validateArtifact(BaseProxy.DBFunctionRequest request, String artifactType, String artifactName, com.fasterxml.jackson.databind.JsonNode artifact) {
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

            @Override
            public com.fasterxml.jackson.databind.JsonNode getArtifact(String artifactType, String artifactName) {
                return getArtifact(
                    this.req_getArtifact.on(this.dbClient), artifactType, artifactName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getArtifact(BaseProxy.DBFunctionRequest request, String artifactType, String artifactName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("artifactType", false, BaseProxy.StringType.fromString(artifactType)),
                          BaseProxy.atomicParam("artifactName", false, BaseProxy.StringType.fromString(artifactName))
                          ).responseSingle(false, Format.JSON)
                );
            }
        }

        return new ArtifactServiceImpl(db, serviceDeclaration);
    }

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
   * Invokes the getArtifactTypesInfo operation on the database server
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getArtifactTypesInfo();

  /**
   * Invokes the deleteArtifact operation on the database server
   *
   * @param artifactType	provides input
   * @param artifactName	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode deleteArtifact(String artifactType, String artifactName);

  /**
   * Invokes the downloadConfigurationFiles operation on the database server
   *
   * 
   * @return	as output
   */
    InputStream downloadConfigurationFiles();

  /**
   * Invokes the validateArtifact operation on the database server
   *
   * @param artifactType	provides input
   * @param artifactName	provides input
   * @param artifact	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode validateArtifact(String artifactType, String artifactName, com.fasterxml.jackson.databind.JsonNode artifact);

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

}
