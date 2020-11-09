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

            private BaseProxy.DBFunctionRequest req_writeRecords;
            private BaseProxy.DBFunctionRequest req_initializeRead;
            private BaseProxy.DBFunctionRequest req_finalizeWrite;
            private BaseProxy.DBFunctionRequest req_readRows;
            private BaseProxy.DBFunctionRequest req_initializeWrite;

            private SparkServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/marklogic-data-hub-spark-connector/", servDecl);

                this.req_writeRecords = this.baseProxy.request(
                    "writeRecords.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_NODES);
                this.req_initializeRead = this.baseProxy.request(
                    "initializeRead.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_finalizeWrite = this.baseProxy.request(
                    "finalizeWrite.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_readRows = this.baseProxy.request(
                    "readRows.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_NODES);
                this.req_initializeWrite = this.baseProxy.request(
                    "initializeWrite.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
            }

            @Override
            public void writeRecords(Reader endpointConstants, Stream<Reader> input) {
                writeRecords(
                    this.req_writeRecords.on(this.dbClient), endpointConstants, input
                    );
            }
            private void writeRecords(BaseProxy.DBFunctionRequest request, Reader endpointConstants, Stream<Reader> input) {
              request
                      .withParams(
                          BaseProxy.documentParam("endpointConstants", true, BaseProxy.JsonDocumentType.fromReader(endpointConstants)),
                          BaseProxy.documentParam("input", true, BaseProxy.JsonDocumentType.fromReader(input))
                          ).responseNone();
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
            public void finalizeWrite(String jobId, String status) {
                finalizeWrite(
                    this.req_finalizeWrite.on(this.dbClient), jobId, status
                    );
            }
            private void finalizeWrite(BaseProxy.DBFunctionRequest request, String jobId, String status) {
              request
                      .withParams(
                          BaseProxy.atomicParam("jobId", false, BaseProxy.StringType.fromString(jobId)),
                          BaseProxy.atomicParam("status", false, BaseProxy.StringType.fromString(status))
                          ).responseNone();
            }

            @Override
            public Stream<Reader> readRows(Reader endpointState, Reader endpointConstants) {
                return readRows(
                    this.req_readRows.on(this.dbClient), endpointState, endpointConstants
                    );
            }
            private Stream<Reader> readRows(BaseProxy.DBFunctionRequest request, Reader endpointState, Reader endpointConstants) {
              return BaseProxy.JsonDocumentType.toReader(
                request
                      .withParams(
                          BaseProxy.documentParam("endpointState", true, BaseProxy.JsonDocumentType.fromReader(endpointState)),
                          BaseProxy.documentParam("endpointConstants", true, BaseProxy.JsonDocumentType.fromReader(endpointConstants))
                          ).responseMultiple(true, Format.JSON)
                );
            }

            @Override
            public String initializeWrite(com.fasterxml.jackson.databind.JsonNode externalMetadata) {
                return initializeWrite(
                    this.req_initializeWrite.on(this.dbClient), externalMetadata
                    );
            }
            private String initializeWrite(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode externalMetadata) {
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
   * Supports the Spark connector in writing many records at once
   *
   * @param endpointConstants	provides input
   * @param input	provides input
   * 
   */
    void writeRecords(Reader endpointConstants, Stream<Reader> input);

  /**
   * Determines the schema and set of partitions based on the user's inputs
   *
   * @param inputs	JSON object defining the inputs for the export query; supports view, schema, sqlCondition, and partitionCount
   * @return	JSON object containing a 'schema' object and a 'partitions' 
   */
    com.fasterxml.jackson.databind.JsonNode initializeRead(com.fasterxml.jackson.databind.JsonNode inputs);

  /**
   * Finalize a write process, which includes updating the job document
   *
   * @param jobId	ID of the job document
   * @param status	Status of the job
   * 
   */
    void finalizeWrite(String jobId, String status);

  /**
   * Return a JSON array for each row that matches the user's query, as defined by the endpointConstants
   *
   * @param endpointState	provides input
   * @param endpointConstants	provides input
   * @return	A JSON array for each matching row for the given partition batch
   */
    Stream<Reader> readRows(Reader endpointState, Reader endpointConstants);

  /**
   * Initializes a write process, which includes creating a job document
   *
   * @param externalMetadata	Optional JSON object that will be added to the job document if not null
   * @return	The ID of the created job
   */
    String initializeWrite(com.fasterxml.jackson.databind.JsonNode externalMetadata);

}
