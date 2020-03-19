package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface SavedQueriesService {
    /**
     * Creates a SavedQueriesService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static SavedQueriesService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a SavedQueriesService object for executing operations on the database server.
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
    static SavedQueriesService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class SavedQueriesServiceImpl implements SavedQueriesService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_saveSavedQuery;

            private SavedQueriesServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/savedQueries/", servDecl);

                this.req_saveSavedQuery = this.baseProxy.request(
                    "saveSavedQuery.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
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
        }

        return new SavedQueriesServiceImpl(db, serviceDeclaration);
    }

  /**
   * Invokes the saveSavedQuery operation on the database server
   *
   * @param saveQuery	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode saveSavedQuery(com.fasterxml.jackson.databind.JsonNode saveQuery);

}
