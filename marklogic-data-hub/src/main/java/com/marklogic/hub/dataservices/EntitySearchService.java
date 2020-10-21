package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;
import java.util.stream.Stream;


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
            private BaseProxy.DBFunctionRequest req_exportSearchAsCSV;
            private BaseProxy.DBFunctionRequest req_getRecord;
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
                this.req_exportSearchAsCSV = this.baseProxy.request(
                    "exportSearchAsCSV.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
                this.req_getRecord = this.baseProxy.request(
                    "getRecord.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
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
            public java.io.Reader exportSearchAsCSV(String structuredQuery, String searchText, String queryOptions, String schemaName, String viewName, Long limit, com.fasterxml.jackson.databind.node.ArrayNode sortOrder, Stream<String> columns) {
                return exportSearchAsCSV(
                    this.req_exportSearchAsCSV.on(this.dbClient), structuredQuery, searchText, queryOptions, schemaName, viewName, limit, sortOrder, columns
                    );
            }
            private java.io.Reader exportSearchAsCSV(BaseProxy.DBFunctionRequest request, String structuredQuery, String searchText, String queryOptions, String schemaName, String viewName, Long limit, com.fasterxml.jackson.databind.node.ArrayNode sortOrder, Stream<String> columns) {
              return BaseProxy.TextDocumentType.toReader(
                request
                      .withParams(
                          BaseProxy.atomicParam("structuredQuery", false, BaseProxy.StringType.fromString(structuredQuery)),
                          BaseProxy.atomicParam("searchText", true, BaseProxy.StringType.fromString(searchText)),
                          BaseProxy.atomicParam("queryOptions", false, BaseProxy.StringType.fromString(queryOptions)),
                          BaseProxy.atomicParam("schemaName", false, BaseProxy.StringType.fromString(schemaName)),
                          BaseProxy.atomicParam("viewName", false, BaseProxy.StringType.fromString(viewName)),
                          BaseProxy.atomicParam("limit", true, BaseProxy.LongType.fromLong(limit)),
                          BaseProxy.documentParam("sortOrder", false, BaseProxy.ArrayType.fromArrayNode(sortOrder)),
                          BaseProxy.atomicParam("columns", false, BaseProxy.StringType.fromString(columns))
                          ).responseSingle(false, Format.TEXT)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getRecord(String docUri) {
                return getRecord(
                    this.req_getRecord.on(this.dbClient), docUri
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getRecord(BaseProxy.DBFunctionRequest request, String docUri) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("docUri", false, BaseProxy.StringType.fromString(docUri))
                          ).responseSingle(false, Format.JSON)
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
   * Invokes the exportSearchAsCSV operation on the database server
   *
   * @param structuredQuery	provides input
   * @param searchText	provides input
   * @param queryOptions	provides input
   * @param schemaName	provides input
   * @param viewName	provides input
   * @param limit	provides input
   * @param sortOrder	provides input
   * @param columns	provides input
   * @return	as output
   */
    java.io.Reader exportSearchAsCSV(String structuredQuery, String searchText, String queryOptions, String schemaName, String viewName, Long limit, com.fasterxml.jackson.databind.node.ArrayNode sortOrder, Stream<String> columns);

  /**
   * Invokes the getRecord operation on the database server
   *
   * @param docUri	The URI of the document to be returned
   * @return	The document with the URI provided
   */
    com.fasterxml.jackson.databind.JsonNode getRecord(String docUri);

  /**
   * Invokes the getMatchingPropertyValues operation on the database server
   *
   * @param facetValuesSearchQuery	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getMatchingPropertyValues(com.fasterxml.jackson.databind.JsonNode facetValuesSearchQuery);

}
