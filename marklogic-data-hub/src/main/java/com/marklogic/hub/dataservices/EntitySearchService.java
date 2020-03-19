package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.impl.BaseProxy;
import com.marklogic.client.io.Format;

/**
 * Provides a set of operations on the database server
 */
public interface EntitySearchService {

  /**
   * Creates a EntitySearchService object for executing operations on the database server.
   *
   * The DatabaseClientFactory class can create the DatabaseClient parameter. A single client object
   * can be used for any number of requests and in multiple threads.
   *
   * @param db provides a client for communicating with the database server
   * @return an object for session state
   */
  static EntitySearchService on(DatabaseClient db) {
    final class EntitySearchServiceImpl implements EntitySearchService {

      private BaseProxy baseProxy;

      private EntitySearchServiceImpl(DatabaseClient dbClient) {
        baseProxy = new BaseProxy(dbClient, "/data-hub/5/data-services/entitySearch/");
      }

      @Override
      public com.fasterxml.jackson.databind.JsonNode getMinAndMaxPropertyValues(String entityTypeId,
          String propertyPath, String referenceType) {
        return BaseProxy.JsonDocumentType.toJsonNode(
            baseProxy
                .request("getMinAndMaxPropertyValues.sjs",
                    BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS)
                .withSession()
                .withParams(
                    BaseProxy.atomicParam("entityTypeId", false,
                        BaseProxy.StringType.fromString(entityTypeId)),
                    BaseProxy.atomicParam("propertyPath", false,
                        BaseProxy.StringType.fromString(propertyPath)),
                    BaseProxy.atomicParam("referenceType", false,
                        BaseProxy.StringType.fromString(referenceType)))
                .withMethod("POST")
                .responseSingle(false, Format.JSON)
        );
      }


      @Override
      public com.fasterxml.jackson.databind.JsonNode getMatchingPropertyValues(String entityTypeId,
          String propertyPath, String referenceType, String pattern, Integer limit) {
        return BaseProxy.JsonDocumentType.toJsonNode(
            baseProxy
                .request("getMatchingPropertyValues.sjs",
                    BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS)
                .withSession()
                .withParams(
                    BaseProxy.atomicParam("entityTypeId", false,
                        BaseProxy.StringType.fromString(entityTypeId)),
                    BaseProxy.atomicParam("propertyPath", false,
                        BaseProxy.StringType.fromString(propertyPath)),
                    BaseProxy.atomicParam("referenceType", false,
                        BaseProxy.StringType.fromString(referenceType)),
                    BaseProxy
                        .atomicParam("pattern", false, BaseProxy.StringType.fromString(pattern)),
                    BaseProxy.atomicParam("limit", false, BaseProxy.IntegerType.fromInteger(limit)))
                .withMethod("POST")
                .responseSingle(false, Format.JSON)
        );
      }

    }

    return new EntitySearchServiceImpl(db);
  }

  /**
   * Invokes the getMinAndMaxPropertyValues operation on the database server
   *
   * @param entityTypeId provides input
   * @param propertyPath provides input
   * @param referenceType provides input
   * @return as output
   */
  com.fasterxml.jackson.databind.JsonNode getMinAndMaxPropertyValues(String entityTypeId,
                                                                     String propertyPath, String referenceType);

  /**
   * Invokes the getMatchingPropertyValues operation on the database server
   *
   * @param entityTypeId provides input
   * @param propertyPath provides input
   * @param referenceType provides input
   * @param pattern provides input
   * @param limit provides input
   * @return as output
   */
  com.fasterxml.jackson.databind.JsonNode getMatchingPropertyValues(String entityTypeId,
                                                                    String propertyPath, String referenceType, String pattern, Integer limit);

}
