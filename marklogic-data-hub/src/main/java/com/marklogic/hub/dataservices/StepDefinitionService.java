package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface StepDefinitionService {
    /**
     * Creates a StepDefinitionService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static StepDefinitionService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a StepDefinitionService object for executing operations on the database server.
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
    static StepDefinitionService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class StepDefinitionServiceImpl implements StepDefinitionService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_getStepDefinition;
            private BaseProxy.DBFunctionRequest req_deleteStepDefinition;

            private StepDefinitionServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/stepDefinition/", servDecl);

                this.req_getStepDefinition = this.baseProxy.request(
                    "getStepDefinition.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_deleteStepDefinition = this.baseProxy.request(
                    "deleteStepDefinition.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getStepDefinition(String name, String type) {
                return getStepDefinition(
                    this.req_getStepDefinition.on(this.dbClient), name, type
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getStepDefinition(BaseProxy.DBFunctionRequest request, String name, String type) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("name", false, BaseProxy.StringType.fromString(name)),
                          BaseProxy.atomicParam("type", false, BaseProxy.StringType.fromString(type))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public void deleteStepDefinition(String name) {
                deleteStepDefinition(
                    this.req_deleteStepDefinition.on(this.dbClient), name
                    );
            }
            private void deleteStepDefinition(BaseProxy.DBFunctionRequest request, String name) {
              request
                      .withParams(
                          BaseProxy.atomicParam("name", false, BaseProxy.StringType.fromString(name))
                          ).responseNone();
            }
        }

        return new StepDefinitionServiceImpl(db, serviceDeclaration);
    }

  /**
   * Invokes the getStepDefinition operation on the database server
   *
   * @param name	provides input
   * @param type	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getStepDefinition(String name, String type);

  /**
   * Invokes the deleteStepDefinition operation on the database server
   *
   * @param name	provides input
   * 
   */
    void deleteStepDefinition(String name);

}
