package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface SecurityService {
    /**
     * Creates a SecurityService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static SecurityService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a SecurityService object for executing operations on the database server.
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
    static SecurityService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class SecurityServiceImpl implements SecurityService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_getAuthorities;

            private SecurityServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/security/", servDecl);

                this.req_getAuthorities = this.baseProxy.request(
                    "getAuthorities.sjs", BaseProxy.ParameterValuesKind.NONE);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getAuthorities() {
                return getAuthorities(
                    this.req_getAuthorities.on(this.dbClient)
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getAuthorities(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request.responseSingle(false, Format.JSON)
                );
            }
        }

        return new SecurityServiceImpl(db, serviceDeclaration);
    }

  /**
   * Invokes the getAuthorities operation on the database server
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getAuthorities();

}
