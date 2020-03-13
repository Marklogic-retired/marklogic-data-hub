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

            private BaseProxy.DBFunctionRequest req_testMapping;
            private BaseProxy.DBFunctionRequest req_getMappingFunctions;

            private MappingServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/mapping/", servDecl);

                this.req_testMapping = this.baseProxy.request(
                    "testMapping.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
                this.req_getMappingFunctions = this.baseProxy.request(
                    "getMappingFunctions.sjs", BaseProxy.ParameterValuesKind.NONE);
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
        }

        return new MappingServiceImpl(db, serviceDeclaration);
    }

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
   * Invokes the getMappingFunctions operation on the database server
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getMappingFunctions();

}
