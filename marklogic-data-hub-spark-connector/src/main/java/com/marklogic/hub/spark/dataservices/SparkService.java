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

            private BaseProxy.DBFunctionRequest req_initializeRead;
            private BaseProxy.DBFunctionRequest req_findRowsForPartitionBatch;
            private BaseProxy.DBFunctionRequest req_finalizeJob;
            private BaseProxy.DBFunctionRequest req_bulkIngest;
            private BaseProxy.DBFunctionRequest req_initializeJob;

            private SparkServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/marklogic-data-hub-spark-connector/", servDecl);

                this.req_initializeRead = this.baseProxy.request(
                    "initializeRead.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_findRowsForPartitionBatch = this.baseProxy.request(
                    "findRowsForPartitionBatch.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_NODES);
                this.req_finalizeJob = this.baseProxy.request(
                    "finalizeJob.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_bulkIngest = this.baseProxy.request(
                    "bulkIngester.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_NODES);
                this.req_initializeJob = this.baseProxy.request(
                    "initializeJob.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode initializeRead(com.fasterxml.jackson.databind.JsonNode inputs) {
                return initializeRead(
                    this.req_initializeRead.on(this.dbClient), inputs
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode initializeRead(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode inputs) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("inputs", false, BaseProxy.JsonDocumentType.fromJsonNode(inputs))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public Stream<Reader> findRowsForPartitionBatch(Reader endpointState, Reader endpointConstants) {
                return findRowsForPartitionBatch(
                    this.req_findRowsForPartitionBatch.on(this.dbClient), endpointState, endpointConstants
                    );
            }
            private Stream<Reader> findRowsForPartitionBatch(BaseProxy.DBFunctionRequest request, Reader endpointState, Reader endpointConstants) {
              return BaseProxy.JsonDocumentType.toReader(
                request
                      .withParams(
                          BaseProxy.documentParam("endpointState", true, BaseProxy.JsonDocumentType.fromReader(endpointState)),
                          BaseProxy.documentParam("endpointConstants", true, BaseProxy.JsonDocumentType.fromReader(endpointConstants))
                          ).responseMultiple(true, Format.JSON)
                );
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
            public String initializeJob(com.fasterxml.jackson.databind.JsonNode externalMetadata) {
                return initializeJob(
                    this.req_initializeJob.on(this.dbClient), externalMetadata
                    );
            }
            private String initializeJob(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode externalMetadata) {
              return BaseProxy.StringType.toString(
                request
                      .withParams(
                          BaseProxy.documentParam("externalMetadata", true, BaseProxy.JsonDocumentType.fromJsonNode(externalMetadata))
                          ).responseSingle(false, null)
                );
            }
        }

        return new SparkServiceImpl(db, serviceDeclaration);
    }

  /**
   * Determines the schema and set of partitions based on the user's inputs
   *
   * @param inputs	JSON object defining the inputs for the export query; supports view, schema, sqlCondition, and partitionCount
   * @return	JSON object containing a 'schema' object and a 'partitions' 
   */
    com.fasterxml.jackson.databind.JsonNode initializeRead(com.fasterxml.jackson.databind.JsonNode inputs);

  /**
   * Finds rows matching the user's query for the partition batch, all of which is defined in endpointConstants
   *
   * @param endpointState	provides input
   * @param endpointConstants	provides input
   * @return	A JSON array for each matching row for the given partition batch
   */
    Stream<Reader> findRowsForPartitionBatch(Reader endpointState, Reader endpointConstants);

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
   * JSON object that, if not null, will be added to the job document with a key of 'externalMetadata
   *
   * @param externalMetadata	provides input
   * @return	The ID of the created job
   */
    String initializeJob(com.fasterxml.jackson.databind.JsonNode externalMetadata);

}
