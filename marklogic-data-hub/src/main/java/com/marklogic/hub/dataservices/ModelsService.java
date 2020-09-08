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
            private BaseProxy.DBFunctionRequest req_generateProtectedPathConfig;
            private BaseProxy.DBFunctionRequest req_generateModelConfig;
            private BaseProxy.DBFunctionRequest req_getPrimaryEntityTypes;
            private BaseProxy.DBFunctionRequest req_deleteModel;
            private BaseProxy.DBFunctionRequest req_createModel;
            private BaseProxy.DBFunctionRequest req_saveModels;
            private BaseProxy.DBFunctionRequest req_getModelReferences;
            private BaseProxy.DBFunctionRequest req_updateModelEntityTypes;
            private BaseProxy.DBFunctionRequest req_getLatestJobData;

            private ModelsServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/models/", servDecl);

                this.req_updateModelInfo = this.baseProxy.request(
                    "updateModelInfo.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_saveModel = this.baseProxy.request(
                    "saveModel.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_generateProtectedPathConfig = this.baseProxy.request(
                    "generateProtectedPathConfig.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_generateModelConfig = this.baseProxy.request(
                    "generateModelConfig.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_getPrimaryEntityTypes = this.baseProxy.request(
                    "getPrimaryEntityTypes.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_deleteModel = this.baseProxy.request(
                    "deleteModel.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_createModel = this.baseProxy.request(
                    "createModel.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_saveModels = this.baseProxy.request(
                    "saveModels.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_getModelReferences = this.baseProxy.request(
                    "getModelReferences.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_updateModelEntityTypes = this.baseProxy.request(
                    "updateModelEntityTypes.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_getLatestJobData = this.baseProxy.request(
                    "getLatestJobData.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
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
            public com.fasterxml.jackson.databind.JsonNode generateProtectedPathConfig(com.fasterxml.jackson.databind.JsonNode models) {
                return generateProtectedPathConfig(
                    this.req_generateProtectedPathConfig.on(this.dbClient), models
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode generateProtectedPathConfig(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode models) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("models", false, BaseProxy.JsonDocumentType.fromJsonNode(models))
                          ).responseSingle(false, Format.JSON)
                );
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
            public void deleteModel(String entityName) {
                deleteModel(
                    this.req_deleteModel.on(this.dbClient), entityName
                    );
            }
            private void deleteModel(BaseProxy.DBFunctionRequest request, String entityName) {
              request
                      .withParams(
                          BaseProxy.atomicParam("entityName", false, BaseProxy.StringType.fromString(entityName))
                          ).responseNone();
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
            public void saveModels(com.fasterxml.jackson.databind.JsonNode models) {
                saveModels(
                    this.req_saveModels.on(this.dbClient), models
                    );
            }
            private void saveModels(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode models) {
              request
                      .withParams(
                          BaseProxy.documentParam("models", false, BaseProxy.JsonDocumentType.fromJsonNode(models))
                          ).responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getModelReferences(String entityName) {
                return getModelReferences(
                    this.req_getModelReferences.on(this.dbClient), entityName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getModelReferences(BaseProxy.DBFunctionRequest request, String entityName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("entityName", false, BaseProxy.StringType.fromString(entityName))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public void updateModelEntityTypes(com.fasterxml.jackson.databind.JsonNode input) {
                updateModelEntityTypes(
                    this.req_updateModelEntityTypes.on(this.dbClient), input
                    );
            }
            private void updateModelEntityTypes(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode input) {
              request
                      .withParams(
                          BaseProxy.documentParam("input", false, BaseProxy.JsonDocumentType.fromJsonNode(input))
                          ).responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getLatestJobData(String entityCollection) {
                return getLatestJobData(
                    this.req_getLatestJobData.on(this.dbClient), entityCollection
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getLatestJobData(BaseProxy.DBFunctionRequest request, String entityCollection) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("entityCollection", false, BaseProxy.StringType.fromString(entityCollection))
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
   * Generate a CMA config object with protected paths and query rolesets based on the 'pii' arrays in the given entity models
   *
   * @param models	Array of entity models
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode generateProtectedPathConfig(com.fasterxml.jackson.databind.JsonNode models);

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
   * Delete an entity model
   *
   * @param entityName	The name of the primary entity in the model
   * 
   */
    void deleteModel(String entityName);

  /**
   * Create a new model, resulting in a new entity descriptor with a primary entity type in it.
   *
   * @param input	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode createModel(com.fasterxml.jackson.databind.JsonNode input);

  /**
   * Save an array of entity models to only the database associated with the app server that receives this request
   *
   * @param models	The array of entity models
   * 
   */
    void saveModels(com.fasterxml.jackson.databind.JsonNode models);

  /**
   * Returns a json containing the names of the models and steps that reference the given entity model.
   *
   * @param entityName	The name of the primary entity in the model
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getModelReferences(String entityName);

  /**
   * Invokes the updateModelEntityTypes operation on the database server
   *
   * @param input	provides input
   * 
   */
    void updateModelEntityTypes(com.fasterxml.jackson.databind.JsonNode input);

  /**
   * Invokes the getLatestJobData operation on the database server
   *
   * @param entityCollection	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getLatestJobData(String entityCollection);

}
