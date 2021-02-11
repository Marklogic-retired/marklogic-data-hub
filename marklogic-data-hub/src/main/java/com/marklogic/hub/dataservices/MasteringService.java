package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface MasteringService {
    /**
     * Creates a MasteringService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static MasteringService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a MasteringService object for executing operations on the database server.
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
    static MasteringService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class MasteringServiceImpl implements MasteringService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_calculateMergingActivity;
            private BaseProxy.DBFunctionRequest req_validateMatchingStep;
            private BaseProxy.DBFunctionRequest req_updateMergeOptions;
            private BaseProxy.DBFunctionRequest req_calculateMatchingActivity;
            private BaseProxy.DBFunctionRequest req_updateMatchOptions;
            private BaseProxy.DBFunctionRequest req_getDefaultCollections;
            private BaseProxy.DBFunctionRequest req_validateMergingStep;

            private MasteringServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/mastering/", servDecl);

                this.req_calculateMergingActivity = this.baseProxy.request(
                    "calculateMergingActivity.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_validateMatchingStep = this.baseProxy.request(
                    "validateMatchingStep.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_updateMergeOptions = this.baseProxy.request(
                    "updateMergeOptions.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_calculateMatchingActivity = this.baseProxy.request(
                    "calculateMatchingActivity.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_updateMatchOptions = this.baseProxy.request(
                    "updateMatchOptions.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_getDefaultCollections = this.baseProxy.request(
                    "getDefaultCollections.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_validateMergingStep = this.baseProxy.request(
                    "validateMergingStep.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode calculateMergingActivity(String stepName) {
                return calculateMergingActivity(
                    this.req_calculateMergingActivity.on(this.dbClient), stepName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode calculateMergingActivity(BaseProxy.DBFunctionRequest request, String stepName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode validateMatchingStep(String stepName) {
                return validateMatchingStep(
                    this.req_validateMatchingStep.on(this.dbClient), stepName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode validateMatchingStep(BaseProxy.DBFunctionRequest request, String stepName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode updateMergeOptions(com.fasterxml.jackson.databind.JsonNode options) {
                return updateMergeOptions(
                    this.req_updateMergeOptions.on(this.dbClient), options
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode updateMergeOptions(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode options) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("options", false, BaseProxy.JsonDocumentType.fromJsonNode(options))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode calculateMatchingActivity(String stepName) {
                return calculateMatchingActivity(
                    this.req_calculateMatchingActivity.on(this.dbClient), stepName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode calculateMatchingActivity(BaseProxy.DBFunctionRequest request, String stepName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode updateMatchOptions(com.fasterxml.jackson.databind.JsonNode options) {
                return updateMatchOptions(
                    this.req_updateMatchOptions.on(this.dbClient), options
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode updateMatchOptions(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode options) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("options", false, BaseProxy.JsonDocumentType.fromJsonNode(options))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getDefaultCollections(String entityType) {
                return getDefaultCollections(
                    this.req_getDefaultCollections.on(this.dbClient), entityType
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getDefaultCollections(BaseProxy.DBFunctionRequest request, String entityType) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("entityType", false, BaseProxy.StringType.fromString(entityType))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode validateMergingStep(String stepName) {
                return validateMergingStep(
                    this.req_validateMergingStep.on(this.dbClient), stepName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode validateMergingStep(BaseProxy.DBFunctionRequest request, String stepName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("stepName", false, BaseProxy.StringType.fromString(stepName))
                          ).responseSingle(false, Format.JSON)
                );
            }
        }

        return new MasteringServiceImpl(db, serviceDeclaration);
    }

  /**
   * Calculates tangential information about a merging step to provide configuration insights. Returns a list of source names that apply to the target Entity Type.
   *
   * @param stepName	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode calculateMergingActivity(String stepName);

  /**
   * Invokes the validateMatchingStep operation on the database server
   *
   * @param stepName	provides input
   * @return	Returns an array of zero or more warning objects; each object has "level" and "message" properties
   */
    com.fasterxml.jackson.databind.JsonNode validateMatchingStep(String stepName);

  /**
   * Invokes the updateMergeOptions operation on the database server
   *
   * @param options	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode updateMergeOptions(com.fasterxml.jackson.databind.JsonNode options);

  /**
   * Invokes the calculateMatchingActivity operation on the database server
   *
   * @param stepName	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode calculateMatchingActivity(String stepName);

  /**
   * Invokes the updateMatchOptions operation on the database server
   *
   * @param options	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode updateMatchOptions(com.fasterxml.jackson.databind.JsonNode options);

  /**
   * Invokes the getDefaultCollections operation on the database server
   *
   * @param entityType	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getDefaultCollections(String entityType);

  /**
   * Provides feedback in the form of errors and warnings about a merge step.
   *
   * @param stepName	provides input
   * @return	Returns an array of zero or more warning objects; each object has "level" and "message" properties
   */
    com.fasterxml.jackson.databind.JsonNode validateMergingStep(String stepName);

}
