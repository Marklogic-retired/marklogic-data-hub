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

            private BaseProxy.DBFunctionRequest req_describeRole;
            private BaseProxy.DBFunctionRequest req_describeUser;

            private SecurityServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/security/", servDecl);

                this.req_describeRole = this.baseProxy.request(
                    "describeRole.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_describeUser = this.baseProxy.request(
                    "describeUser.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode describeRole(String roleName) {
                return describeRole(
                    this.req_describeRole.on(this.dbClient), roleName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode describeRole(BaseProxy.DBFunctionRequest request, String roleName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("roleName", false, BaseProxy.StringType.fromString(roleName))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode describeUser(String username) {
                return describeUser(
                    this.req_describeUser.on(this.dbClient), username
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode describeUser(BaseProxy.DBFunctionRequest request, String username) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("username", false, BaseProxy.StringType.fromString(username))
                          ).responseSingle(false, Format.JSON)
                );
            }
        }

        return new SecurityServiceImpl(db, serviceDeclaration);
    }

  /**
   * Returns the roles, privileges, default permissions, and default collections for the given role
   *
   * @param roleName	Name of the MarkLogic role to describe
   * @return	JSON object containing the role description data
   */
    com.fasterxml.jackson.databind.JsonNode describeRole(String roleName);

  /**
   * Returns the roles, privileges, default permissions, and default collections for the given username
   *
   * @param username	Name of the MarkLogic user to describe
   * @return	JSON object containing the user description data
   */
    com.fasterxml.jackson.databind.JsonNode describeUser(String username);

}
