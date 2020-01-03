package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;
import com.marklogic.client.io.marker.AbstractWriteHandle;


import com.marklogic.client.DatabaseClient;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface StepDefinitionService {
    /**
     * Creates a StepDefinitionService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for session state
     */
    static StepDefinitionService on(DatabaseClient db) {
        final class StepDefinitionServiceImpl implements StepDefinitionService {
            private BaseProxy baseProxy;

            private StepDefinitionServiceImpl(DatabaseClient dbClient) {
                baseProxy = new BaseProxy(dbClient, "/data-hub/5/data-services/stepDefinition/");
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getStepDefinition(String name, String type) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                baseProxy
                .request("getStepDefinition.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS)
                .withSession()
                .withParams(
                    BaseProxy.atomicParam("name", false, BaseProxy.StringType.fromString(name)),
                    BaseProxy.atomicParam("type", false, BaseProxy.StringType.fromString(type)))
                .withMethod("POST")
                .responseSingle(false, Format.JSON)
                );
            }

        }

        return new StepDefinitionServiceImpl(db);
    }

  /**
   * Invokes the getStepDefinition operation on the database server
   *
   * @param name	provides input
   * @param type	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getStepDefinition(String name, String type);

}
