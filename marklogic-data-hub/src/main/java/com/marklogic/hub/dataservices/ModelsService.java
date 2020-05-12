package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface ModelsService {
    /**
     * Creates a ModelsService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static ModelsService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a ModelsService object for executing operations on the database server.
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
    static ModelsService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class ModelsServiceImpl implements ModelsService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_updateModelInfo;
            private BaseProxy.DBFunctionRequest req_saveModel;
            private BaseProxy.DBFunctionRequest req_generateModelConfig;
            private BaseProxy.DBFunctionRequest req_getPrimaryEntityTypes;
            private BaseProxy.DBFunctionRequest req_createModel;
            private BaseProxy.DBFunctionRequest req_updateModelEntityTypes;

            private ModelsServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/models/", servDecl);

                this.req_updateModelInfo = this.baseProxy.request(
                    "updateModelInfo.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_saveModel = this.baseProxy.request(
                    "saveModel.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_generateModelConfig = this.baseProxy.request(
                    "generateModelConfig.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_getPrimaryEntityTypes = this.baseProxy.request(
                    "getPrimaryEntityTypes.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_createModel = this.baseProxy.request(
                    "createModel.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_updateModelEntityTypes = this.baseProxy.request(
                    "updateModelEntityTypes.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode updateModelInfo(String name, String description) {
                return updateModelInfo(
                    this.req_updateModelInfo.on(this.dbClient), name, description
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode updateModelInfo(BaseProxy.DBFunctionRequest request, String name, String description) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("name", false, BaseProxy.StringType.fromString(name)),
                          BaseProxy.atomicParam("description", false, BaseProxy.StringType.fromString(description))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public void saveModel(com.fasterxml.jackson.databind.JsonNode model) {
                saveModel(
                    this.req_saveModel.on(this.dbClient), model
                    );
            }
            private void saveModel(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode model) {
              request
                      .withParams(
                          BaseProxy.documentParam("model", false, BaseProxy.JsonDocumentType.fromJsonNode(model))
                          ).responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode generateModelConfig() {
                return generateModelConfig(
                    this.req_generateModelConfig.on(this.dbClient)
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode generateModelConfig(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request.responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getPrimaryEntityTypes() {
                return getPrimaryEntityTypes(
                    this.req_getPrimaryEntityTypes.on(this.dbClient)
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getPrimaryEntityTypes(BaseProxy.DBFunctionRequest request) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request.responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode createModel(com.fasterxml.jackson.databind.JsonNode input) {
                return createModel(
                    this.req_createModel.on(this.dbClient), input
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode createModel(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode input) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("input", false, BaseProxy.JsonDocumentType.fromJsonNode(input))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode updateModelEntityTypes(String name, com.fasterxml.jackson.databind.JsonNode input) {
                return updateModelEntityTypes(
                    this.req_updateModelEntityTypes.on(this.dbClient), name, input
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode updateModelEntityTypes(BaseProxy.DBFunctionRequest request, String name, com.fasterxml.jackson.databind.JsonNode input) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("name", false, BaseProxy.StringType.fromString(name)),
                          BaseProxy.documentParam("input", false, BaseProxy.JsonDocumentType.fromJsonNode(input))
                          ).responseSingle(false, Format.JSON)
                );
            }
        }

        return new ModelsServiceImpl(db, serviceDeclaration);
    }

  /**
   * Update the description of an existing model. Model title and version cannot yet be edited because doing so would break existing mapping and mastering configurations.
   *
   * @param name	The name of the model
   * @param description	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode updateModelInfo(String name, String description);

  /**
   * Save a model, where the input is a JSON model
   *
   * @param model	provides input
   * 
   */
    void saveModel(com.fasterxml.jackson.databind.JsonNode model);

  /**
   * Invokes the generateModelConfig operation on the database server
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode generateModelConfig();

  /**
   * Returns an array of primary entity types. A primary entity type is the entity type in a model descriptor with a name equal to the title of the model descriptor.
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getPrimaryEntityTypes();

  /**
   * Create a new model, resulting in a new entity descriptor with a primary entity type in it.
   *
   * @param input	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode createModel(com.fasterxml.jackson.databind.JsonNode input);

  /**
   * Invokes the updateModelEntityTypes operation on the database server
   *
   * @param name	The name of the model
   * @param input	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode updateModelEntityTypes(String name, com.fasterxml.jackson.databind.JsonNode input);

}
