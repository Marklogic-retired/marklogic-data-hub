package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;
import com.marklogic.client.io.marker.AbstractWriteHandle;


import com.marklogic.client.DatabaseClient;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface RolesService {
    /**
     * Creates a RolesService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for session state
     */
    static RolesService on(DatabaseClient db) {
        final class RolesServiceImpl implements RolesService {
            private BaseProxy baseProxy;

            private RolesServiceImpl(DatabaseClient dbClient) {
                baseProxy = new BaseProxy(dbClient, "/data-hub/5/data-services/roles/");
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getRoles() {
              return BaseProxy.JsonDocumentType.toJsonNode(
                baseProxy
                .request("getRoles.sjs", BaseProxy.ParameterValuesKind.NONE)
                .withSession()
                .withParams(
                    )
                .withMethod("POST")
                .responseSingle(false, Format.JSON)
                );
            }

        }

        return new RolesServiceImpl(db);
    }

  /**
   * Invokes the getRoles operation on the database server
   *
   * 
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getRoles();

}
