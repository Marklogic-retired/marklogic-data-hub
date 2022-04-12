package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface ExploreDataService {
    /**
     * Creates a ExploreDataService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static ExploreDataService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a ExploreDataService object for executing operations on the database server.
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
    static ExploreDataService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class ExploreDataServiceImpl implements ExploreDataService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_saveUserMetaData;
            private BaseProxy.DBFunctionRequest req_searchAndTransform;
            private BaseProxy.DBFunctionRequest req_getEntityModels;
            private BaseProxy.DBFunctionRequest req_getUserMetaData;
            private BaseProxy.DBFunctionRequest req_getRecords;
            private BaseProxy.DBFunctionRequest req_getRecentlyVisitedRecords;
            private BaseProxy.DBFunctionRequest req_saveRecentlyVisitedRecord;

            private ExploreDataServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/explore-data/data-services/ml-exp-search/", servDecl);

                this.req_saveUserMetaData = this.baseProxy.request(
                    "saveUserMetaData.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_searchAndTransform = this.baseProxy.request(
                    "searchAndTransform.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_getEntityModels = this.baseProxy.request(
                    "getEntityModels.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_getUserMetaData = this.baseProxy.request(
                    "getUserMetaData.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_getRecords = this.baseProxy.request(
                    "getRecords.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_getRecentlyVisitedRecords = this.baseProxy.request(
                    "getRecentlyVisitedRecords.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_saveRecentlyVisitedRecord = this.baseProxy.request(
                    "saveRecentlyVisitedRecord.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
            }

            @Override
            public void saveUserMetaData(com.fasterxml.jackson.databind.JsonNode userMetaData) {
                saveUserMetaData(
                    this.req_saveUserMetaData.on(this.dbClient), userMetaData
                    );
            }
            private void saveUserMetaData(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode userMetaData) {
              request
                      .withParams(
                          BaseProxy.documentParam("userMetaData", false, BaseProxy.JsonDocumentType.fromJsonNode(userMetaData))
                          ).responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode searchAndTransform(com.fasterxml.jackson.databind.JsonNode searchParams) {
                return searchAndTransform(
                    this.req_searchAndTransform.on(this.dbClient), searchParams
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode searchAndTransform(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode searchParams) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("searchParams", false, BaseProxy.JsonDocumentType.fromJsonNode(searchParams))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getEntityModels() {
                return getEntityModels(
                    this.req_getEntityModels.on(this.dbClient)
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getEntityModels(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request.responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getUserMetaData(String user) {
                return getUserMetaData(
                    this.req_getUserMetaData.on(this.dbClient), user
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getUserMetaData(BaseProxy.DBFunctionRequest request, String user) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("user", false, BaseProxy.StringType.fromString(user))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getRecords(com.fasterxml.jackson.databind.JsonNode recordIds) {
                return getRecords(
                    this.req_getRecords.on(this.dbClient), recordIds
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getRecords(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode recordIds) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("recordIds", false, BaseProxy.JsonDocumentType.fromJsonNode(recordIds))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getRecentlyVisitedRecords(String user) {
                return getRecentlyVisitedRecords(
                    this.req_getRecentlyVisitedRecords.on(this.dbClient), user
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getRecentlyVisitedRecords(BaseProxy.DBFunctionRequest request, String user) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("user", false, BaseProxy.StringType.fromString(user))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public void saveRecentlyVisitedRecord(com.fasterxml.jackson.databind.JsonNode recentlyVisitedRecord) {
                saveRecentlyVisitedRecord(
                    this.req_saveRecentlyVisitedRecord.on(this.dbClient), recentlyVisitedRecord
                    );
            }
            private void saveRecentlyVisitedRecord(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode recentlyVisitedRecord) {
              request
                      .withParams(
                          BaseProxy.documentParam("recentlyVisitedRecord", false, BaseProxy.JsonDocumentType.fromJsonNode(recentlyVisitedRecord))
                          ).responseNone();
            }
        }

        return new ExploreDataServiceImpl(db, serviceDeclaration);
    }

  /**
   * Invokes the saveUserMetaData operation on the database server
   *
   * @param userMetaData	provides input
   * 
   */
    void saveUserMetaData(com.fasterxml.jackson.databind.JsonNode userMetaData);

  /**
   * Invokes the searchAndTransform operation on the database server
   *
   * @param searchParams	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode searchAndTransform(com.fasterxml.jackson.databind.JsonNode searchParams);

  /**
   * Invokes the getEntityModels operation on the database server
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getEntityModels();

  /**
   * Invokes the getUserMetaData operation on the database server
   *
   * @param user	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getUserMetaData(String user);

  /**
   * Invokes the getRecords operation on the database server
   *
   * @param recordIds	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getRecords(com.fasterxml.jackson.databind.JsonNode recordIds);

  /**
   * Invokes the getRecentlyVisitedRecords operation on the database server
   *
   * @param user	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getRecentlyVisitedRecords(String user);

  /**
   * Invokes the saveRecentlyVisitedRecord operation on the database server
   *
   * @param recentlyVisitedRecord	provides input
   * 
   */
    void saveRecentlyVisitedRecord(com.fasterxml.jackson.databind.JsonNode recentlyVisitedRecord);

}
