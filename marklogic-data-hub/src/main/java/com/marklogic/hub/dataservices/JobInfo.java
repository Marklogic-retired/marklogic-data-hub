package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.impl.BaseProxy;
import com.marklogic.client.io.Format;

/**
 * Provides a set of operations on the database server
 */
public interface JobInfo {
    /**
     * Creates a JobInfo object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for session state
     */
    static JobInfo on(DatabaseClient db) {
        final class JobInfoImpl implements JobInfo {
            private BaseProxy baseProxy;

            private JobInfoImpl(DatabaseClient dbClient) {
                baseProxy = new BaseProxy(dbClient, "/data-hub/5/data-services/jobInfo/");
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getLatestJobData(String entityCollection) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                baseProxy
                .request("jobInfo.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC)
                .withSession()
                .withParams(
                    BaseProxy.atomicParam("entityCollection", false, BaseProxy.StringType.fromString(entityCollection)))
                .withMethod("POST")
                .responseSingle(false, Format.JSON)
                );
            }

        }

        return new JobInfoImpl(db);
    }

  /**
   * Invokes the getLatestJobData operation on the database server
   *
   * @param entityCollection	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getLatestJobData(String entityCollection);

}
