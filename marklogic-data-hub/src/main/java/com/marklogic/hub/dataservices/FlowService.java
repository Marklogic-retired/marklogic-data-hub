package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface FlowService {
    /**
     * Creates a FlowService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static FlowService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a FlowService object for executing operations on the database server.
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
    static FlowService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class FlowServiceImpl implements FlowService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_addStepToFlow;
            private BaseProxy.DBFunctionRequest req_createFlow;
            private BaseProxy.DBFunctionRequest req_deleteFlow;
            private BaseProxy.DBFunctionRequest req_getFlow;
            private BaseProxy.DBFunctionRequest req_getFlowsWithStepDetails;
            private BaseProxy.DBFunctionRequest req_getFlowWithLatestJobInfo;
            private BaseProxy.DBFunctionRequest req_getFullFlow;
            private BaseProxy.DBFunctionRequest req_removeStepFromFlow;
            private BaseProxy.DBFunctionRequest req_updateFlow;

            private FlowServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/flow/", servDecl);

                this.req_addStepToFlow = this.baseProxy.request(
                    "addStepToFlow.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_createFlow = this.baseProxy.request(
                    "createFlow.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_deleteFlow = this.baseProxy.request(
                    "deleteFlow.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_getFlow = this.baseProxy.request(
                    "getFlow.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_getFlowsWithStepDetails = this.baseProxy.request(
                    "getFlowsWithStepDetails.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_getFlowWithLatestJobInfo = this.baseProxy.request(
                    "getFlowWithLatestJobInfo.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_getFullFlow = this.baseProxy.request(
                    "getFullFlow.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_removeStepFromFlow = this.baseProxy.request(
                    "removeStepFromFlow.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_updateFlow = this.baseProxy.request(
                    "updateFlow.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode addStepToFlow(String flowName, String stepName, String stepDefinitionType) {
                return addStepToFlow(
                    this.req_addStepToFlow.on(this.dbClient), flowName, stepName, stepDefinitionType
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode addStepToFlow(BaseProxy.DBFunctionRequest request, String flowName, String stepName, String stepDefinitionType) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("flowName", false, BaseProxy.StringType.fromString(flowName)),
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName)),
                          BaseProxy.atomicParam("stepDefinitionType", false, BaseProxy.StringType.fromString(stepDefinitionType))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode createFlow(String name, String description) {
                return createFlow(
                    this.req_createFlow.on(this.dbClient), name, description
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode createFlow(BaseProxy.DBFunctionRequest request, String name, String description) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("name", false, BaseProxy.StringType.fromString(name)),
                          BaseProxy.atomicParam("description", true, BaseProxy.StringType.fromString(description))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public void deleteFlow(String name) {
                deleteFlow(
                    this.req_deleteFlow.on(this.dbClient), name
                    );
            }
            private void deleteFlow(BaseProxy.DBFunctionRequest request, String name) {
              request
                      .withParams(
                          BaseProxy.atomicParam("name", false, BaseProxy.StringType.fromString(name))
                          ).responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getFlow(String name) {
                return getFlow(
                    this.req_getFlow.on(this.dbClient), name
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getFlow(BaseProxy.DBFunctionRequest request, String name) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("name", false, BaseProxy.StringType.fromString(name))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getFlowsWithStepDetails() {
                return getFlowsWithStepDetails(
                    this.req_getFlowsWithStepDetails.on(this.dbClient)
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getFlowsWithStepDetails(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request.responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getFlowWithLatestJobInfo(String name) {
                return getFlowWithLatestJobInfo(
                    this.req_getFlowWithLatestJobInfo.on(this.dbClient), name
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getFlowWithLatestJobInfo(BaseProxy.DBFunctionRequest request, String name) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("name", false, BaseProxy.StringType.fromString(name))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getFullFlow(String flowName) {
                return getFullFlow(
                    this.req_getFullFlow.on(this.dbClient), flowName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getFullFlow(BaseProxy.DBFunctionRequest request, String flowName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("flowName", false, BaseProxy.StringType.fromString(flowName))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode removeStepFromFlow(String flowName, String stepNumber) {
                return removeStepFromFlow(
                    this.req_removeStepFromFlow.on(this.dbClient), flowName, stepNumber
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode removeStepFromFlow(BaseProxy.DBFunctionRequest request, String flowName, String stepNumber) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("flowName", false, BaseProxy.StringType.fromString(flowName)),
                          BaseProxy.atomicParam("stepNumber", false, BaseProxy.StringType.fromString(stepNumber))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode updateFlow(String name, String description, com.fasterxml.jackson.databind.node.ArrayNode stepIds) {
                return updateFlow(
                    this.req_updateFlow.on(this.dbClient), name, description, stepIds
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode updateFlow(BaseProxy.DBFunctionRequest request, String name, String description, com.fasterxml.jackson.databind.node.ArrayNode stepIds) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("name", false, BaseProxy.StringType.fromString(name)),
                          BaseProxy.atomicParam("description", true, BaseProxy.StringType.fromString(description)),
                          BaseProxy.documentParam("stepIds", true, BaseProxy.ArrayType.fromArrayNode(stepIds))
                          ).responseSingle(false, Format.JSON)
                );
            }
        }

        return new FlowServiceImpl(db, serviceDeclaration);
    }

  /**
   * Invokes the addStepToFlow operation on the database server
   *
   * @param flowName	provides input
   * @param stepName	provides input
   * @param stepDefinitionType	provides input
   * @return	Return the updated flow document
   */
    com.fasterxml.jackson.databind.JsonNode addStepToFlow(String flowName, String stepName, String stepDefinitionType);

  /**
   * Invokes the createFlow operation on the database server
   *
   * @param name	provides input
   * @param description	provides input
   * @return	Return the created flow document
   */
    com.fasterxml.jackson.databind.JsonNode createFlow(String name, String description);

  /**
   * Invokes the deleteFlow operation on the database server
   *
   * @param name	provides input
   * 
   */
    void deleteFlow(String name);

  /**
   * Invokes the getFlow operation on the database server
   *
   * @param name	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getFlow(String name);

  /**
   * Invokes the getFlowsWithStepDetails operation on the database server
   *
   * 
   * @return	Return an array of flow documents, where each step has a few identifying data points and abstracts whether it's inline or referenced
   */
    com.fasterxml.jackson.databind.JsonNode getFlowsWithStepDetails();

  /**
   * Invokes the getFlowWithLatestJobInfo operation on the database server
   *
   * @param name	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getFlowWithLatestJobInfo(String name);

  /**
   * Invokes the getFullFlow operation on the database server
   *
   * @param flowName	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getFullFlow(String flowName);

  /**
   * Invokes the removeStepFromFlow operation on the database server
   *
   * @param flowName	provides input
   * @param stepNumber	provides input
   * @return	Return the updated flow document
   */
    com.fasterxml.jackson.databind.JsonNode removeStepFromFlow(String flowName, String stepNumber);

  /**
   * Invokes the updateFlow operation on the database server
   *
   * @param name	provides input
   * @param description	The description of the flow can be updated.
   * @param stepIds	The order of stepIds can be updated.
   * @return	Return the updated flow document
   */
    com.fasterxml.jackson.databind.JsonNode updateFlow(String name, String description, com.fasterxml.jackson.databind.node.ArrayNode stepIds);

}
