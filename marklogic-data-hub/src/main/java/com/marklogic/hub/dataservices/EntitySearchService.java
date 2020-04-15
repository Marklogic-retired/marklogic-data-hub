package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface EntitySearchService {
    /**
     * Creates a EntitySearchService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static EntitySearchService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a EntitySearchService object for executing operations on the database server.
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
    static EntitySearchService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class EntitySearchServiceImpl implements EntitySearchService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_getMinAndMaxPropertyValues;
            private BaseProxy.DBFunctionRequest req_getSavedQuery;
            private BaseProxy.DBFunctionRequest req_deleteSavedQuery;
            private BaseProxy.DBFunctionRequest req_saveSavedQuery;
            private BaseProxy.DBFunctionRequest req_getSavedQueries;
            private BaseProxy.DBFunctionRequest req_getMatchingPropertyValues;

            private EntitySearchServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/entitySearch/", servDecl);

                this.req_getMinAndMaxPropertyValues = this.baseProxy.request(
                    "getMinAndMaxPropertyValues.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_getSavedQuery = this.baseProxy.request(
                    "getSavedQuery.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_deleteSavedQuery = this.baseProxy.request(
                    "deleteSavedQuery.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_saveSavedQuery = this.baseProxy.request(
                    "saveSavedQuery.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_getSavedQueries = this.baseProxy.request(
                    "getSavedQueries.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_getMatchingPropertyValues = this.baseProxy.request(
                    "getMatchingPropertyValues.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getMinAndMaxPropertyValues(com.fasterxml.jackson.databind.JsonNode facetRangeSearchQuery) {
                return getMinAndMaxPropertyValues(
                    this.req_getMinAndMaxPropertyValues.on(this.dbClient), facetRangeSearchQuery
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getMinAndMaxPropertyValues(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode facetRangeSearchQuery) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("facetRangeSearchQuery", false, BaseProxy.JsonDocumentType.fromJsonNode(facetRangeSearchQuery))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getSavedQuery(String id) {
                return getSavedQuery(
                    this.req_getSavedQuery.on(this.dbClient), id
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getSavedQuery(BaseProxy.DBFunctionRequest request, String id) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("id", false, BaseProxy.StringType.fromString(id))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public void deleteSavedQuery(String id) {
                deleteSavedQuery(
                    this.req_deleteSavedQuery.on(this.dbClient), id
                    );
            }
            private void deleteSavedQuery(BaseProxy.DBFunctionRequest request, String id) {
              request
                      .withParams(
                          BaseProxy.atomicParam("id", false, BaseProxy.StringType.fromString(id))
                          ).responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode saveSavedQuery(com.fasterxml.jackson.databind.JsonNode saveQuery) {
                return saveSavedQuery(
                    this.req_saveSavedQuery.on(this.dbClient), saveQuery
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode saveSavedQuery(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode saveQuery) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("saveQuery", false, BaseProxy.JsonDocumentType.fromJsonNode(saveQuery))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getSavedQueries() {
                return getSavedQueries(
                    this.req_getSavedQueries.on(this.dbClient)
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getSavedQueries(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request.responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getMatchingPropertyValues(com.fasterxml.jackson.databind.JsonNode facetValuesSearchQuery) {
                return getMatchingPropertyValues(
                    this.req_getMatchingPropertyValues.on(this.dbClient), facetValuesSearchQuery
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getMatchingPropertyValues(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode facetValuesSearchQuery) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("facetValuesSearchQuery", false, BaseProxy.JsonDocumentType.fromJsonNode(facetValuesSearchQuery))
                          ).responseSingle(false, Format.JSON)
                );
            }
        }

        return new EntitySearchServiceImpl(db, serviceDeclaration);
    }

  /**
   * Invokes the getMinAndMaxPropertyValues operation on the database server
   *
   * @param facetRangeSearchQuery	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getMinAndMaxPropertyValues(com.fasterxml.jackson.databind.JsonNode facetRangeSearchQuery);

  /**
   * Invokes the getSavedQuery operation on the database server
   *
   * @param id	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getSavedQuery(String id);

  /**
   * Invokes the deleteSavedQuery operation on the database server
   *
   * @param id	provides input
   * 
   */
    void deleteSavedQuery(String id);

  /**
   * Invokes the saveSavedQuery operation on the database server
   *
   * @param saveQuery	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode saveSavedQuery(com.fasterxml.jackson.databind.JsonNode saveQuery);

  /**
   * Invokes the getSavedQueries operation on the database server
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getSavedQueries();

  /**
   * Invokes the getMatchingPropertyValues operation on the database server
   *
   * @param facetValuesSearchQuery	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getMatchingPropertyValues(com.fasterxml.jackson.databind.JsonNode facetValuesSearchQuery);

}
