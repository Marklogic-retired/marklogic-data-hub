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

            private BaseProxy.DBFunctionRequest req_getReferences;
            private BaseProxy.DBFunctionRequest req_getEntitiesForMapping;
            private BaseProxy.DBFunctionRequest req_testMapping;
            private BaseProxy.DBFunctionRequest req_getDocument;
            private BaseProxy.DBFunctionRequest req_getUris;
            private BaseProxy.DBFunctionRequest req_generateMappingTransforms;
            private BaseProxy.DBFunctionRequest req_getMappingFunctions;
            private BaseProxy.DBFunctionRequest req_generateMappingFunctions;

            private MappingServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/data-services/mapping/", servDecl);

                this.req_getReferences = this.baseProxy.request(
                    "getReferences.mjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_getEntitiesForMapping = this.baseProxy.request(
                    "getEntitiesForMapping.mjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_testMapping = this.baseProxy.request(
                    "testMapping.mjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
                this.req_getDocument = this.baseProxy.request(
                    "getDocument.mjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_getUris = this.baseProxy.request(
                    "getUris.mjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_generateMappingTransforms = this.baseProxy.request(
                    "generateMappingTransforms.mjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_getMappingFunctions = this.baseProxy.request(
                    "getMappingFunctions.mjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_generateMappingFunctions = this.baseProxy.request(
                    "generateMappingFunctions.mjs", BaseProxy.ParameterValuesKind.NONE);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getReferences(String stepName) {
                return getReferences(
                    this.req_getReferences.on(this.dbClient), stepName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getReferences(BaseProxy.DBFunctionRequest request, String stepName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getEntitiesForMapping(String entityName) {
                return getEntitiesForMapping(
                    this.req_getEntitiesForMapping.on(this.dbClient), entityName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getEntitiesForMapping(BaseProxy.DBFunctionRequest request, String entityName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("entityName", false, BaseProxy.StringType.fromString(entityName))
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

            @Override
            public com.fasterxml.jackson.databind.JsonNode getDocument(String stepName, String uri) {
                return getDocument(
                    this.req_getDocument.on(this.dbClient), stepName, uri
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getDocument(BaseProxy.DBFunctionRequest request, String stepName, String uri) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName)),
                          BaseProxy.atomicParam("uri", false, BaseProxy.StringType.fromString(uri))
                          ).responseSingle(false, Format.JSON)
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
            public void generateMappingTransforms() {
                generateMappingTransforms(
                    this.req_generateMappingTransforms.on(this.dbClient)
                    );
            }
            private void generateMappingTransforms(BaseProxy.DBFunctionRequest request) {
              request.responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getMappingFunctions(Boolean excludeMLMappingFunctions) {
                return getMappingFunctions(
                    this.req_getMappingFunctions.on(this.dbClient), excludeMLMappingFunctions
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getMappingFunctions(BaseProxy.DBFunctionRequest request, Boolean excludeMLMappingFunctions) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("excludeMLMappingFunctions", true, BaseProxy.BooleanType.fromBoolean(excludeMLMappingFunctions))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public void generateMappingFunctions() {
                generateMappingFunctions(
                    this.req_generateMappingFunctions.on(this.dbClient)
                    );
            }
            private void generateMappingFunctions(BaseProxy.DBFunctionRequest request) {
              request.responseNone();
            }
        }

        return new MappingServiceImpl(db, serviceDeclaration);
    }

  /**
   * Gets the references  associated with given mapping step name.
   *
   * @param stepName	provides input
   * @return	An array of objects, where each object has a reference name and an optional description
   */
    com.fasterxml.jackson.databind.JsonNode getReferences(String stepName);

  /**
   * Gets the specified entity model and all its related entity models
   *
   * @param entityName	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getEntitiesForMapping(String entityName);

  /**
   * Invokes the testMapping operation on the database server
   *
   * @param uri	provides input
   * @param database	provides input
   * @param jsonMapping	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode testMapping(String uri, String database, com.fasterxml.jackson.databind.JsonNode jsonMapping);

  /**
   * Gets the document based on the given URI from the source database associated with the given step name
   *
   * @param stepName	provides input
   * @param uri	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getDocument(String stepName, String uri);

  /**
   * Gets the list of URIs that match the 'sourceQuery' from source db  associated with given step name. The uri count is specified by 'limit' parameter 
   *
   * @param stepName	provides input
   * @param limit	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getUris(String stepName, Integer limit);

  /**
   * Generates a transform in the modules database for each legacy mapping or mapping step
   *
   * 
   * 
   */
    void generateMappingTransforms();

  /**
   * Invokes the getMappingFunctions operation on the database server
   *
   * @param excludeMLMappingFunctions	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getMappingFunctions(Boolean excludeMLMappingFunctions);

  /**
   * Generates mapping function meta for custom functions
   *
   * 
   * 
   */
    void generateMappingFunctions();

}
