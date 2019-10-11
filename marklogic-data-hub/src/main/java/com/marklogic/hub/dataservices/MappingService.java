package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;
import com.marklogic.client.io.marker.AbstractWriteHandle;


import com.marklogic.client.DatabaseClient;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface MappingService {
    /**
     * Creates a MappingService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for session state
     */
    static MappingService on(DatabaseClient db) {
        final class MappingServiceImpl implements MappingService {
            private BaseProxy baseProxy;

            private MappingServiceImpl(DatabaseClient dbClient) {
                baseProxy = new BaseProxy(dbClient, "/data-hub/5/data-services/mapping/");
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode testMapping(String docURI, String mappingName, String mappingVersion) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                baseProxy
                .request("testMapping.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS)
                .withSession()
                .withParams(
                    BaseProxy.atomicParam("docURI", false, BaseProxy.StringType.fromString(docURI)),
                    BaseProxy.atomicParam("mappingName", false, BaseProxy.StringType.fromString(mappingName)),
                    BaseProxy.atomicParam("mappingVersion", false, BaseProxy.StringType.fromString(mappingVersion)))
                .withMethod("POST")
                .responseSingle(false, Format.JSON)
                );
            }

        }

        return new MappingServiceImpl(db);
    }

  /**
   * Invokes the testMapping operation on the database server
   *
   * @param docURI	provides input
   * @param mappingName	provides input
   * @param mappingVersion	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode testMapping(String docURI, String mappingName, String mappingVersion);

}
