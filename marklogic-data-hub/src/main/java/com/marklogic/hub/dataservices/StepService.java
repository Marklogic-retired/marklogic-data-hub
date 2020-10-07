package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import java.util.stream.Stream;
import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface StepService {
    /**
     * Creates a StepService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static StepService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a StepService object for executing operations on the database server.
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
    static StepService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class StepServiceImpl implements StepService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_getStepsByType;
            private BaseProxy.DBFunctionRequest req_saveStep;
            private BaseProxy.DBFunctionRequest req_deleteStep;
            private BaseProxy.DBFunctionRequest req_getStep;

            private StepServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/step/", servDecl);

                this.req_getStepsByType = this.baseProxy.request(
                    "getStepsByType.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_saveStep = this.baseProxy.request(
                    "saveStep.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
                this.req_deleteStep = this.baseProxy.request(
                    "deleteStep.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_getStep = this.baseProxy.request(
                    "getStep.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getStepsByType(Stream<String> propertiesToReturn) {
                return getStepsByType(
                    this.req_getStepsByType.on(this.dbClient), propertiesToReturn
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getStepsByType(BaseProxy.DBFunctionRequest request, Stream<String> propertiesToReturn) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("propertiesToReturn", true, BaseProxy.StringType.fromString(propertiesToReturn))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode saveStep(String stepDefinitionType, com.fasterxml.jackson.databind.JsonNode stepProperties, Boolean overwrite) {
                return saveStep(
                    this.req_saveStep.on(this.dbClient), stepDefinitionType, stepProperties, overwrite
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode saveStep(BaseProxy.DBFunctionRequest request, String stepDefinitionType, com.fasterxml.jackson.databind.JsonNode stepProperties, Boolean overwrite) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("stepDefinitionType", false, BaseProxy.StringType.fromString(stepDefinitionType)),
                          BaseProxy.documentParam("stepProperties", false, BaseProxy.JsonDocumentType.fromJsonNode(stepProperties)),
                          BaseProxy.atomicParam("overwrite", false, BaseProxy.BooleanType.fromBoolean(overwrite))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public void deleteStep(String stepDefinitionType, String stepName) {
                deleteStep(
                    this.req_deleteStep.on(this.dbClient), stepDefinitionType, stepName
                    );
            }
            private void deleteStep(BaseProxy.DBFunctionRequest request, String stepDefinitionType, String stepName) {
              request
                      .withParams(
                          BaseProxy.atomicParam("stepDefinitionType", false, BaseProxy.StringType.fromString(stepDefinitionType)),
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName))
                          ).responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getStep(String stepDefinitionType, String stepName) {
                return getStep(
                    this.req_getStep.on(this.dbClient), stepDefinitionType, stepName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getStep(BaseProxy.DBFunctionRequest request, String stepDefinitionType, String stepName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("stepDefinitionType", false, BaseProxy.StringType.fromString(stepDefinitionType)),
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName))
                          ).responseSingle(false, Format.JSON)
                );
            }
        }

        return new StepServiceImpl(db, serviceDeclaration);
    }

  /**
   * Invokes the getStepsByType operation on the database server
   *
   * @param propertiesToReturn	List of properties to return. Default behavior returns all properties
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getStepsByType(Stream<String> propertiesToReturn);

  /**
   * Invokes the saveStep operation on the database server
   *
   * @param stepDefinitionType	provides input
   * @param stepProperties	provides input
   * @param overwrite	provides input
   * @return	Return the created/updated step document
   */
    com.fasterxml.jackson.databind.JsonNode saveStep(String stepDefinitionType, com.fasterxml.jackson.databind.JsonNode stepProperties, Boolean overwrite);

  /**
   * Invokes the deleteStep operation on the database server
   *
   * @param stepDefinitionType	provides input
   * @param stepName	provides input
   * 
   */
    void deleteStep(String stepDefinitionType, String stepName);

  /**
   * Invokes the getStep operation on the database server
   *
   * @param stepDefinitionType	provides input
   * @param stepName	provides input
   * @return	Return the step document
   */
    com.fasterxml.jackson.databind.JsonNode getStep(String stepDefinitionType, String stepName);

}
