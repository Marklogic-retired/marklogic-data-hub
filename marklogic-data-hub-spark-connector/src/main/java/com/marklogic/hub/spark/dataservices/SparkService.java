package com.marklogic.hub.spark.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;
import java.io.Reader;
import java.util.stream.Stream;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Defines endpoints needed by the Spark connector
 */
public interface SparkService {
    /**
     * Creates a SparkService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static SparkService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a SparkService object for executing operations on the database server.
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
    static SparkService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class SparkServiceImpl implements SparkService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_finalizeJob;
            private BaseProxy.DBFunctionRequest req_bulkIngest;
            private BaseProxy.DBFunctionRequest req_initializeJob;

            private SparkServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/marklogic-data-hub-spark-connector/", servDecl);

                this.req_finalizeJob = this.baseProxy.request(
                    "finalizeJob.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_bulkIngest = this.baseProxy.request(
                    "bulkIngester.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_NODES);
                this.req_initializeJob = this.baseProxy.request(
                    "initializeJob.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
            }

            @Override
            public void finalizeJob(String jobId, String status) {
                finalizeJob(
                    this.req_finalizeJob.on(this.dbClient), jobId, status
                    );
            }
            private void finalizeJob(BaseProxy.DBFunctionRequest request, String jobId, String status) {
              request
                      .withParams(
                          BaseProxy.atomicParam("jobId", false, BaseProxy.StringType.fromString(jobId)),
                          BaseProxy.atomicParam("status", false, BaseProxy.StringType.fromString(status))
                          ).responseNone();
            }

            @Override
            public void bulkIngest(Reader endpointConstants, Stream<Reader> input) {
                bulkIngest(
                    this.req_bulkIngest.on(this.dbClient), endpointConstants, input
                    );
            }
            private void bulkIngest(BaseProxy.DBFunctionRequest request, Reader endpointConstants, Stream<Reader> input) {
              request
                      .withParams(
                          BaseProxy.documentParam("endpointConstants", true, BaseProxy.JsonDocumentType.fromReader(endpointConstants)),
                          BaseProxy.documentParam("input", true, BaseProxy.JsonDocumentType.fromReader(input))
                          ).responseNone();
            }

            @Override
            public String initializeJob(com.fasterxml.jackson.databind.JsonNode sparkMetadata) {
                return initializeJob(
                    this.req_initializeJob.on(this.dbClient), sparkMetadata
                    );
            }
            private String initializeJob(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode sparkMetadata) {
              return BaseProxy.StringType.toString(
                request
                      .withParams(
                          BaseProxy.documentParam("sparkMetadata", true, BaseProxy.JsonDocumentType.fromJsonNode(sparkMetadata))
                          ).responseSingle(false, null)
                );
            }
        }

        return new SparkServiceImpl(db, serviceDeclaration);
    }

  /**
   * Update the job document after records have been written or an error has occurred
   *
   * @param jobId	ID of the job document
   * @param status	Status of the job
   * 
   */
    void finalizeJob(String jobId, String status);

  /**
   * Bulk ingestion endpoint for writing documents via the Spark connector
   *
   * @param endpointConstants	provides input
   * @param input	provides input
   * 
   */
    void bulkIngest(Reader endpointConstants, Stream<Reader> input);

  /**
   * Creates a job document with the given sparkMetadata as a property
   *
   * @param sparkMetadata	provides input
   * @return	The ID of the created job
   */
    String initializeJob(com.fasterxml.jackson.databind.JsonNode sparkMetadata);

}
