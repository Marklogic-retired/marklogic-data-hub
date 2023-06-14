package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.SessionState;
import com.marklogic.client.io.Format;
import java.io.Reader;
import java.util.stream.Stream;
import java.io.InputStream;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Provides a set of operations on the database server
 */
public interface StepRunnerService {
    /**
     * Creates a StepRunnerService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static StepRunnerService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a StepRunnerService object for executing operations on the database server.
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
    static StepRunnerService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class StepRunnerServiceImpl implements StepRunnerService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_queryBatchFeed;
            private BaseProxy.DBFunctionRequest req_queryCount;
            private BaseProxy.DBFunctionRequest req_processIngestBatch;
            private BaseProxy.DBFunctionRequest req_processBatch;

            private StepRunnerServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/data-services/stepRunner/", servDecl);

                this.req_queryBatchFeed = this.baseProxy.request(
                    "queryBatchFeed.mjs", BaseProxy.ParameterValuesKind.MULTIPLE_NODES);
                this.req_queryCount = this.baseProxy.request(
                    "queryCount.mjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_processIngestBatch = this.baseProxy.request(
                    "processIngestBatch.mjs", BaseProxy.ParameterValuesKind.MULTIPLE_NODES);
                this.req_processBatch = this.baseProxy.request(
                    "processBatch.mjs", BaseProxy.ParameterValuesKind.MULTIPLE_NODES);
            }
            @Override
            public SessionState newSessionState() {
              return baseProxy.newSessionState();
            }

            @Override
            public Stream<com.fasterxml.jackson.databind.JsonNode> queryBatchFeed(SessionState session, Reader endpointState, Reader endpointConstants) {
                return queryBatchFeed(
                    this.req_queryBatchFeed.on(this.dbClient), session, endpointState, endpointConstants
                    );
            }
            private Stream<com.fasterxml.jackson.databind.JsonNode> queryBatchFeed(BaseProxy.DBFunctionRequest request, SessionState session, Reader endpointState, Reader endpointConstants) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withSession("session", session, true)
                      .withParams(
                          BaseProxy.documentParam("endpointState", true, BaseProxy.JsonDocumentType.fromReader(endpointState)),
                          BaseProxy.documentParam("endpointConstants", false, BaseProxy.JsonDocumentType.fromReader(endpointConstants))
                          ).responseMultiple(true, Format.JSON)
                );
            }

            @Override
            public Long queryCount(com.fasterxml.jackson.databind.JsonNode endpointConstants) {
                return queryCount(
                    this.req_queryCount.on(this.dbClient), endpointConstants
                    );
            }
            private Long queryCount(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode endpointConstants) {
              return BaseProxy.LongType.toLong(
                request
                      .withParams(
                          BaseProxy.documentParam("endpointConstants", false, BaseProxy.JsonDocumentType.fromJsonNode(endpointConstants))
                          ).responseSingle(true, null)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode processIngestBatch(SessionState session, Stream<InputStream> input, Reader endpointState, Reader endpointConstants) {
                return processIngestBatch(
                    this.req_processIngestBatch.on(this.dbClient), session, input, endpointState, endpointConstants
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode processIngestBatch(BaseProxy.DBFunctionRequest request, SessionState session, Stream<InputStream> input, Reader endpointState, Reader endpointConstants) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withSession("session", session, true)
                      .withParams(
                          BaseProxy.documentParam("input", true, BaseProxy.BinaryDocumentType.fromInputStream(input)),
                          BaseProxy.documentParam("endpointState", true, BaseProxy.JsonDocumentType.fromReader(endpointState)),
                          BaseProxy.documentParam("endpointConstants", false, BaseProxy.JsonDocumentType.fromReader(endpointConstants))
                          ).responseSingle(true, Format.JSON)
                );
            }

            @Override
            public Stream<com.fasterxml.jackson.databind.JsonNode> processBatch(SessionState session, Stream<com.fasterxml.jackson.databind.JsonNode> input, Reader endpointState, Reader endpointConstants) {
                return processBatch(
                    this.req_processBatch.on(this.dbClient), session, input, endpointState, endpointConstants
                    );
            }
            private Stream<com.fasterxml.jackson.databind.JsonNode> processBatch(BaseProxy.DBFunctionRequest request, SessionState session, Stream<com.fasterxml.jackson.databind.JsonNode> input, Reader endpointState, Reader endpointConstants) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withSession("session", session, true)
                      .withParams(
                          BaseProxy.documentParam("input", true, BaseProxy.JsonDocumentType.fromJsonNode(input)),
                          BaseProxy.documentParam("endpointState", true, BaseProxy.JsonDocumentType.fromReader(endpointState)),
                          BaseProxy.documentParam("endpointConstants", false, BaseProxy.JsonDocumentType.fromReader(endpointConstants))
                          ).responseMultiple(true, Format.JSON)
                );
            }
        }

        return new StepRunnerServiceImpl(db, serviceDeclaration);
    }
    /**
     * Creates an object to track a session for a set of operations
     * that require session state on the database server.
     *
     * @return	an object for session state
     */
    SessionState newSessionState();

  /**
   * Use this for cts query based to return URIs
   *
   * @param session	Holds the session object
   * @param endpointState	provides input
   * @param endpointConstants	provides input
   * @return	Returns the endpoint state first and second an object with the URIs.
   */
    Stream<com.fasterxml.jackson.databind.JsonNode> queryBatchFeed(SessionState session, Reader endpointState, Reader endpointConstants);

  /**
   * Use this to get counts for cts query based steps that don't require a collector to return URIs
   *
   * @param endpointConstants	provides input
   * @return	as output
   */
    Long queryCount(com.fasterxml.jackson.databind.JsonNode endpointConstants);

  /**
   * Use this for ingestion steps that don't require a collector to return URIs
   *
   * @param session	Holds the session object
   * @param input	Holds input for ingestion and metadata as multipart data
   * @param endpointState	provides input
   * @param endpointConstants	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode processIngestBatch(SessionState session, Stream<InputStream> input, Reader endpointState, Reader endpointConstants);

  /**
   * Replacement for the mlRunFlow REST extension; processes a batch of items using the given flow and step
   *
   * @param session	Holds the session object
   * @param input	Holds input for processing
   * @param endpointState	provides input
   * @param endpointConstants	provides input
   * @return	as output
   */
    Stream<com.fasterxml.jackson.databind.JsonNode> processBatch(SessionState session, Stream<com.fasterxml.jackson.databind.JsonNode> input, Reader endpointState, Reader endpointConstants);

}
