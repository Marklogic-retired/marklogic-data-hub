package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface MappingService {
    /**
     * Creates a MappingService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static MappingService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a MappingService object for executing operations on the database server.
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
    static MappingService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class MappingServiceImpl implements MappingService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_generateMappingTransforms;
            private BaseProxy.DBFunctionRequest req_getDocument;
            private BaseProxy.DBFunctionRequest req_getDocumentForTesting;
            private BaseProxy.DBFunctionRequest req_getMappingFunctions;
            private BaseProxy.DBFunctionRequest req_getUris;
            private BaseProxy.DBFunctionRequest req_testMapping;

            private MappingServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/mapping/", servDecl);

                this.req_generateMappingTransforms = this.baseProxy.request(
                    "generateMappingTransforms.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_getDocument = this.baseProxy.request(
                    "getDocument.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_getDocumentForTesting = this.baseProxy.request(
                    "getDocumentForTesting.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_getMappingFunctions = this.baseProxy.request(
                    "getMappingFunctions.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_getUris = this.baseProxy.request(
                    "getUris.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_testMapping = this.baseProxy.request(
                    "testMapping.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
            }

            @Override
            public void generateMappingTransforms() {
                generateMappingTransforms(
                    this.req_generateMappingTransforms.on(this.dbClient)
                    );
            }
            private void generateMappingTransforms(BaseProxy.DBFunctionRequest request) {
              request.responseNone();
            }

            @Override
            public java.lang.String getDocument(String stepName, String uri) {
                return getDocument(
                    this.req_getDocument.on(this.dbClient), stepName, uri
                    );
            }
            private java.lang.String getDocument(BaseProxy.DBFunctionRequest request, String stepName, String uri) {
              return BaseProxy.TextDocumentType.toString(
                request
                      .withParams(
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName)),
                          BaseProxy.atomicParam("uri", false, BaseProxy.StringType.fromString(uri))
                          ).responseSingle(false, Format.TEXT)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getDocumentForTesting(String stepName, String uri) {
                return getDocumentForTesting(
                    this.req_getDocumentForTesting.on(this.dbClient), stepName, uri
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getDocumentForTesting(BaseProxy.DBFunctionRequest request, String stepName, String uri) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName)),
                          BaseProxy.atomicParam("uri", false, BaseProxy.StringType.fromString(uri))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getMappingFunctions() {
                return getMappingFunctions(
                    this.req_getMappingFunctions.on(this.dbClient)
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getMappingFunctions(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request.responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getUris(String stepName, Integer limit) {
                return getUris(
                    this.req_getUris.on(this.dbClient), stepName, limit
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getUris(BaseProxy.DBFunctionRequest request, String stepName, Integer limit) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName)),
                          BaseProxy.atomicParam("limit", false, BaseProxy.IntegerType.fromInteger(limit))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode testMapping(String uri, String database, com.fasterxml.jackson.databind.JsonNode jsonMapping) {
                return testMapping(
                    this.req_testMapping.on(this.dbClient), uri, database, jsonMapping
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode testMapping(BaseProxy.DBFunctionRequest request, String uri, String database, com.fasterxml.jackson.databind.JsonNode jsonMapping) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("uri", false, BaseProxy.StringType.fromString(uri)),
                          BaseProxy.atomicParam("database", false, BaseProxy.StringType.fromString(database)),
                          BaseProxy.documentParam("jsonMapping", false, BaseProxy.JsonDocumentType.fromJsonNode(jsonMapping))
                          ).responseSingle(false, Format.JSON)
                );
            }
        }

        return new MappingServiceImpl(db, serviceDeclaration);
    }

  /**
   * Generates a transform in the modules database for each legacy mapping or mapping step
   *
   * 
   * 
   */
    void generateMappingTransforms();

  /**
   * Gets the document based on the given URI from the source database associated with the given step name
   *
   * @param stepName	provides input
   * @param uri	provides input
   * @return	as output
   */
    java.lang.String getDocument(String stepName, String uri);

  /**
   * Get an XML or JSON source document (and additional information all formatted as a string of JSON) to facilitate testing a map.
   *
   * @param stepName	provides input
   * @param uri	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getDocumentForTesting(String stepName, String uri);

  /**
   * Invokes the getMappingFunctions operation on the database server
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getMappingFunctions();

  /**
   * Gets the list of URIs that match the 'sourceQuery' from source db  associated with given step name. The uri count is specified by 'limit' parameter 
   *
   * @param stepName	provides input
   * @param limit	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getUris(String stepName, Integer limit);

  /**
   * Invokes the testMapping operation on the database server
   *
   * @param uri	provides input
   * @param database	provides input
   * @param jsonMapping	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode testMapping(String uri, String database, com.fasterxml.jackson.databind.JsonNode jsonMapping);

}
