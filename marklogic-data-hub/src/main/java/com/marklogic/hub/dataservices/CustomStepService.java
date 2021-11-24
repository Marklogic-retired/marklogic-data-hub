package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface CustomStepService {
    /**
     * Creates a CustomStepService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static CustomStepService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a CustomStepService object for executing operations on the database server.
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
    static CustomStepService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class CustomStepServiceImpl implements CustomStepService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_getCustomStep;
            private BaseProxy.DBFunctionRequest req_getCustomSteps;
            private BaseProxy.DBFunctionRequest req_updateCustomStep;

            private CustomStepServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/customStep/", servDecl);

                this.req_getCustomStep = this.baseProxy.request(
                    "getCustomStep.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_getCustomSteps = this.baseProxy.request(
                    "getCustomSteps.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_updateCustomStep = this.baseProxy.request(
                    "updateCustomStep.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getCustomStep(String stepName) {
                return getCustomStep(
                    this.req_getCustomStep.on(this.dbClient), stepName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getCustomStep(BaseProxy.DBFunctionRequest request, String stepName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getCustomSteps() {
                return getCustomSteps(
                    this.req_getCustomSteps.on(this.dbClient)
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getCustomSteps(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request.responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode updateCustomStep(com.fasterxml.jackson.databind.JsonNode stepProperties) {
                return updateCustomStep(
                    this.req_updateCustomStep.on(this.dbClient), stepProperties
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode updateCustomStep(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode stepProperties) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("stepProperties", false, BaseProxy.JsonDocumentType.fromJsonNode(stepProperties))
                          ).responseSingle(false, Format.JSON)
                );
            }
        }

        return new CustomStepServiceImpl(db, serviceDeclaration);
    }

  /**
   * Invokes the getCustomStep operation on the database server
   *
   * @param stepName	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getCustomStep(String stepName);

  /**
   * Invokes the getCustomSteps operation on the database server
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getCustomSteps();

  /**
   * Updates the custom step and returns the updated step
   *
   * @param stepProperties	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode updateCustomStep(com.fasterxml.jackson.databind.JsonNode stepProperties);

}
