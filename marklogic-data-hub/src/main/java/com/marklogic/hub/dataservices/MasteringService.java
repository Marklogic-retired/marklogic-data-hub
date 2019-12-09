package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;
import com.marklogic.client.io.marker.AbstractWriteHandle;


import com.marklogic.client.DatabaseClient;

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
     * @return	an object for session state
     */
    static MasteringService on(DatabaseClient db) {
        final class MasteringServiceImpl implements MasteringService {
            private BaseProxy baseProxy;

            private MasteringServiceImpl(DatabaseClient dbClient) {
                baseProxy = new BaseProxy(dbClient, "/data-hub/5/data-services/mastering/");
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getDefaultCollections(String entityType) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                baseProxy
                .request("getDefaultCollections.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC)
                .withSession()
                .withParams(
                    BaseProxy.atomicParam("entityType", false, BaseProxy.StringType.fromString(entityType)))
                .withMethod("POST")
                .responseSingle(false, Format.JSON)
                );
            }

        }

        return new MasteringServiceImpl(db);
    }

  /**
   * Invokes the getDefaultCollections operation on the database server
   *
   * @param entityType	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getDefaultCollections(String entityType);

}
