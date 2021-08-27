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

            private BaseProxy.DBFunctionRequest req_generateDatabaseProperties;
            private BaseProxy.DBFunctionRequest req_saveDraftModel;
            private BaseProxy.DBFunctionRequest req_deleteDraftModel;
            private BaseProxy.DBFunctionRequest req_createDraftModel;
            private BaseProxy.DBFunctionRequest req_generateProtectedPathConfig;
            private BaseProxy.DBFunctionRequest req_updateDraftModelInfo;
            private BaseProxy.DBFunctionRequest req_generateModelConfig;
            private BaseProxy.DBFunctionRequest req_getPrimaryEntityTypes;
            private BaseProxy.DBFunctionRequest req_saveModels;
            private BaseProxy.DBFunctionRequest req_getModelReferences;
            private BaseProxy.DBFunctionRequest req_publishDraftModels;
            private BaseProxy.DBFunctionRequest req_getLatestJobData;
            private BaseProxy.DBFunctionRequest req_updateDraftModelEntityTypes;

            private ModelsServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/models/", servDecl);

                this.req_generateDatabaseProperties = this.baseProxy.request(
                    "generateDatabaseProperties.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_saveDraftModel = this.baseProxy.request(
                    "saveDraftModel.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_deleteDraftModel = this.baseProxy.request(
                    "deleteDraftModel.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_createDraftModel = this.baseProxy.request(
                    "createDraftModel.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_generateProtectedPathConfig = this.baseProxy.request(
                    "generateProtectedPathConfig.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_updateDraftModelInfo = this.baseProxy.request(
                    "updateDraftModelInfo.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
                this.req_generateModelConfig = this.baseProxy.request(
                    "generateModelConfig.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_getPrimaryEntityTypes = this.baseProxy.request(
                    "getPrimaryEntityTypes.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_saveModels = this.baseProxy.request(
                    "saveModels.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_getModelReferences = this.baseProxy.request(
                    "getModelReferences.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_publishDraftModels = this.baseProxy.request(
                    "publishDraftModels.sjs", BaseProxy.ParameterValuesKind.NONE);
                this.req_getLatestJobData = this.baseProxy.request(
                    "getLatestJobData.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_updateDraftModelEntityTypes = this.baseProxy.request(
                    "updateDraftModelEntityTypes.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode generateDatabaseProperties(com.fasterxml.jackson.databind.JsonNode models) {
                return generateDatabaseProperties(
                    this.req_generateDatabaseProperties.on(this.dbClient), models
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode generateDatabaseProperties(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode models) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("models", false, BaseProxy.JsonDocumentType.fromJsonNode(models))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public void saveDraftModel(com.fasterxml.jackson.databind.JsonNode model) {
                saveDraftModel(
                    this.req_saveDraftModel.on(this.dbClient), model
                    );
            }
            private void saveDraftModel(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode model) {
              request
                      .withParams(
                          BaseProxy.documentParam("model", false, BaseProxy.JsonDocumentType.fromJsonNode(model))
                          ).responseNone();
            }

            @Override
            public void deleteDraftModel(String entityName) {
                deleteDraftModel(
                    this.req_deleteDraftModel.on(this.dbClient), entityName
                    );
            }
            private void deleteDraftModel(BaseProxy.DBFunctionRequest request, String entityName) {
              request
                      .withParams(
                          BaseProxy.atomicParam("entityName", false, BaseProxy.StringType.fromString(entityName))
                          ).responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode createDraftModel(com.fasterxml.jackson.databind.JsonNode input) {
                return createDraftModel(
                    this.req_createDraftModel.on(this.dbClient), input
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode createDraftModel(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode input) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("input", false, BaseProxy.JsonDocumentType.fromJsonNode(input))
                          ).responseSingle(false, Format.JSON)
                );
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
            public com.fasterxml.jackson.databind.JsonNode updateDraftModelInfo(String name, com.fasterxml.jackson.databind.JsonNode input) {
                return updateDraftModelInfo(
                    this.req_updateDraftModelInfo.on(this.dbClient), name, input
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode updateDraftModelInfo(BaseProxy.DBFunctionRequest request, String name, com.fasterxml.jackson.databind.JsonNode input) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("name", false, BaseProxy.StringType.fromString(name)),
                          BaseProxy.documentParam("input", false, BaseProxy.JsonDocumentType.fromJsonNode(input))
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
            public com.fasterxml.jackson.databind.JsonNode getPrimaryEntityTypes(Boolean includeDrafts) {
                return getPrimaryEntityTypes(
                    this.req_getPrimaryEntityTypes.on(this.dbClient), includeDrafts
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getPrimaryEntityTypes(BaseProxy.DBFunctionRequest request, Boolean includeDrafts) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("includeDrafts", false, BaseProxy.BooleanType.fromBoolean(includeDrafts))
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
            public com.fasterxml.jackson.databind.JsonNode getModelReferences(String entityName, String propertyName) {
                return getModelReferences(
                    this.req_getModelReferences.on(this.dbClient), entityName, propertyName
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getModelReferences(BaseProxy.DBFunctionRequest request, String entityName, String propertyName) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("entityName", false, BaseProxy.StringType.fromString(entityName)),
                          BaseProxy.atomicParam("propertyName", true, BaseProxy.StringType.fromString(propertyName))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public void publishDraftModels() {
                publishDraftModels(
                    this.req_publishDraftModels.on(this.dbClient)
                    );
            }
            private void publishDraftModels(BaseProxy.DBFunctionRequest request) {
              request.responseNone();
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

            @Override
            public void updateDraftModelEntityTypes(com.fasterxml.jackson.databind.JsonNode input) {
                updateDraftModelEntityTypes(
                    this.req_updateDraftModelEntityTypes.on(this.dbClient), input
                    );
            }
            private void updateDraftModelEntityTypes(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode input) {
              request
                      .withParams(
                          BaseProxy.documentParam("input", false, BaseProxy.JsonDocumentType.fromJsonNode(input))
                          ).responseNone();
            }
        }

        return new ModelsServiceImpl(db, serviceDeclaration);
    }

  /**
   * Returns a JSON object containing database properties based on entity models
   *
   * @param models	Array of entity models
   * @return	Object containing database properties
   */
    com.fasterxml.jackson.databind.JsonNode generateDatabaseProperties(com.fasterxml.jackson.databind.JsonNode models);

  /**
   * Save a draft model, where the input is a JSON model
   *
   * @param model	provides input
   * 
   */
    void saveDraftModel(com.fasterxml.jackson.databind.JsonNode model);

  /**
   * Mark a draft entity model to be deleted
   *
   * @param entityName	The name of the primary entity in the model
   * 
   */
    void deleteDraftModel(String entityName);

  /**
   * Create a new draft model, resulting in a new entity descriptor with a primary entity type in it.
   *
   * @param input	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode createDraftModel(com.fasterxml.jackson.databind.JsonNode input);

  /**
   * Generate a CMA config object with protected paths and query rolesets based on the 'pii' arrays in the given entity models
   *
   * @param models	Array of entity models
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode generateProtectedPathConfig(com.fasterxml.jackson.databind.JsonNode models);

  /**
   * Update the description and optionally the namespace and namespace prefix of an existing model. Model title and version cannot yet be edited because doing so would break existing mapping and mastering configurations. Changes are saved to the entity model draft collection.
   *
   * @param name	The name of the model
   * @param input	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode updateDraftModelInfo(String name, com.fasterxml.jackson.databind.JsonNode input);

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
   * @param includeDrafts	Determines if draft models should be included. Default: false
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getPrimaryEntityTypes(Boolean includeDrafts);

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
   * @param propertyName	The property in the primary entity in the model
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getModelReferences(String entityName, String propertyName);

  /**
   * Moves draft entity models to the published collection and clear out the draft collection
   *
   * 
   * 
   */
    void publishDraftModels();

  /**
   * Invokes the getLatestJobData operation on the database server
   *
   * @param entityCollection	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getLatestJobData(String entityCollection);

  /**
   * Update entity model types in the entity models draft collection.
   *
   * @param input	provides input
   * 
   */
    void updateDraftModelEntityTypes(com.fasterxml.jackson.databind.JsonNode input);

}
