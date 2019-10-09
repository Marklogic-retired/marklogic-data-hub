package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;
import com.marklogic.client.io.marker.AbstractWriteHandle;


import com.marklogic.client.DatabaseClient;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface SourceDataService {
    /**
     * Creates a SourceDataService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for session state
     */
    static SourceDataService on(DatabaseClient db) {
        final class SourceDataServiceImpl implements SourceDataService {
            private BaseProxy baseProxy;

            private SourceDataServiceImpl(DatabaseClient dbClient) {
                baseProxy = new BaseProxy(dbClient, "/data-hub/5/data-services/sourceData/");
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getSourceDataDocument(String sourceQuery, Long index) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                baseProxy
                .request("getSourceDataDocument.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS)
                .withSession()
                .withParams(
                    BaseProxy.atomicParam("sourceQuery", false, BaseProxy.StringType.fromString(sourceQuery)),
                    BaseProxy.atomicParam("index", false, BaseProxy.LongType.fromLong(index)))
                .withMethod("POST")
                .responseSingle(false, Format.JSON)
                );
            }

        }

        return new SourceDataServiceImpl(db);
    }

  /**
   * Invokes the getSourceDataDocument operation on the database server
   *
   * @param sourceQuery	provides input
   * @param index	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getSourceDataDocument(String sourceQuery, Long index);

}
