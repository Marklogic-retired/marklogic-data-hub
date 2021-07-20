package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Defines endpoints for managing Job documents
 */
public interface JobService {
    /**
     * Creates a JobService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static JobService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a JobService object for executing operations on the database server.
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
    static JobService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class JobServiceImpl implements JobService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_startStep;
            private BaseProxy.DBFunctionRequest req_finishStep;
            private BaseProxy.DBFunctionRequest req_getJob;
            private BaseProxy.DBFunctionRequest req_startJob;
            private BaseProxy.DBFunctionRequest req_getJobWithDetails;
            private BaseProxy.DBFunctionRequest req_getMatchingPropertyValues;
            private BaseProxy.DBFunctionRequest req_finishJob;
            private BaseProxy.DBFunctionRequest req_findStepResponses;

            private JobServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/job/", servDecl);

                this.req_startStep = this.baseProxy.request(
                    "startStep.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_finishStep = this.baseProxy.request(
                    "finishStep.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
                this.req_getJob = this.baseProxy.request(
                    "getJob.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_startJob = this.baseProxy.request(
                    "startJob.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_getJobWithDetails = this.baseProxy.request(
                    "getJobWithDetails.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_getMatchingPropertyValues = this.baseProxy.request(
                    "getMatchingPropertyValues.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
                this.req_finishJob = this.baseProxy.request(
                    "finishJob.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_ATOMICS);
                this.req_findStepResponses = this.baseProxy.request(
                    "findStepResponses.sjs", BaseProxy.ParameterValuesKind.SINGLE_NODE);
            }

            @Override
            public void startStep(String jobId, String stepNumber) {
                startStep(
                    this.req_startStep.on(this.dbClient), jobId, stepNumber
                    );
            }
            private void startStep(BaseProxy.DBFunctionRequest request, String jobId, String stepNumber) {
              request
                      .withParams(
                          BaseProxy.atomicParam("jobId", false, BaseProxy.StringType.fromString(jobId)),
                          BaseProxy.atomicParam("stepNumber", false, BaseProxy.StringType.fromString(stepNumber))
                          ).responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode finishStep(String jobId, String stepNumber, String stepStatus, com.fasterxml.jackson.databind.JsonNode runStepResponse) {
                return finishStep(
                    this.req_finishStep.on(this.dbClient), jobId, stepNumber, stepStatus, runStepResponse
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode finishStep(BaseProxy.DBFunctionRequest request, String jobId, String stepNumber, String stepStatus, com.fasterxml.jackson.databind.JsonNode runStepResponse) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("jobId", false, BaseProxy.StringType.fromString(jobId)),
                          BaseProxy.atomicParam("stepNumber", false, BaseProxy.StringType.fromString(stepNumber)),
                          BaseProxy.atomicParam("stepStatus", false, BaseProxy.StringType.fromString(stepStatus)),
                          BaseProxy.documentParam("runStepResponse", false, BaseProxy.JsonDocumentType.fromJsonNode(runStepResponse))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getJob(String jobId) {
                return getJob(
                    this.req_getJob.on(this.dbClient), jobId
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getJob(BaseProxy.DBFunctionRequest request, String jobId) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("jobId", false, BaseProxy.StringType.fromString(jobId))
                          ).responseSingle(true, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode startJob(String jobId, String flowName, String stepNumber) {
                return startJob(
                    this.req_startJob.on(this.dbClient), jobId, flowName, stepNumber
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode startJob(BaseProxy.DBFunctionRequest request, String jobId, String flowName, String stepNumber) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("jobId", false, BaseProxy.StringType.fromString(jobId)),
                          BaseProxy.atomicParam("flowName", false, BaseProxy.StringType.fromString(flowName)),
                          BaseProxy.atomicParam("stepNumber", false, BaseProxy.StringType.fromString(stepNumber))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getJobWithDetails(String jobId) {
                return getJobWithDetails(
                    this.req_getJobWithDetails.on(this.dbClient), jobId
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getJobWithDetails(BaseProxy.DBFunctionRequest request, String jobId) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("jobId", false, BaseProxy.StringType.fromString(jobId))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getMatchingPropertyValues(com.fasterxml.jackson.databind.JsonNode facetValuesSearchQuery) {
                return getMatchingPropertyValues(
                    this.req_getMatchingPropertyValues.on(this.dbClient), facetValuesSearchQuery
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getMatchingPropertyValues(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode facetValuesSearchQuery) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("facetValuesSearchQuery", false, BaseProxy.JsonDocumentType.fromJsonNode(facetValuesSearchQuery))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public void finishJob(String jobId, String jobStatus) {
                finishJob(
                    this.req_finishJob.on(this.dbClient), jobId, jobStatus
                    );
            }
            private void finishJob(BaseProxy.DBFunctionRequest request, String jobId, String jobStatus) {
              request
                      .withParams(
                          BaseProxy.atomicParam("jobId", false, BaseProxy.StringType.fromString(jobId)),
                          BaseProxy.atomicParam("jobStatus", false, BaseProxy.StringType.fromString(jobStatus))
                          ).responseNone();
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode findStepResponses(com.fasterxml.jackson.databind.JsonNode endpointConstants) {
                return findStepResponses(
                    this.req_findStepResponses.on(this.dbClient), endpointConstants
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode findStepResponses(BaseProxy.DBFunctionRequest request, com.fasterxml.jackson.databind.JsonNode endpointConstants) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("endpointConstants", true, BaseProxy.JsonDocumentType.fromJsonNode(endpointConstants))
                          ).responseSingle(true, Format.JSON)
                );
            }
        }

        return new JobServiceImpl(db, serviceDeclaration);
    }

  /**
   * Updates the Job document associated with the given jobId to note that the step has been started
   *
   * @param jobId	provides input
   * @param stepNumber	provides input
   * 
   */
    void startStep(String jobId, String stepNumber);

  /**
   * Updates the associated Job document after all batches have been processed for a step
   *
   * @param jobId	provides input
   * @param stepNumber	provides input
   * @param stepStatus	provides input
   * @param runStepResponse	provides input
   * @return	The updated Job document
   */
    com.fasterxml.jackson.databind.JsonNode finishStep(String jobId, String stepNumber, String stepStatus, com.fasterxml.jackson.databind.JsonNode runStepResponse);

  /**
   * Get the Job document associated with the given job ID
   *
   * @param jobId	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getJob(String jobId);

  /**
   * Start a new job for the given flowName by creating a new Job document
   *
   * @param jobId	provides input
   * @param flowName	provides input
   * @param stepNumber	provides input
   * @return	The created Job document
   */
    com.fasterxml.jackson.databind.JsonNode startJob(String jobId, String flowName, String stepNumber);

  /**
   * Get the Job document associated with the given job ID and additional metadata
   *
   * @param jobId	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getJobWithDetails(String jobId);

  /**
   * Invokes the getMatchingPropertyValues operation on the database server
   *
   * @param facetValuesSearchQuery	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getMatchingPropertyValues(com.fasterxml.jackson.databind.JsonNode facetValuesSearchQuery);

  /**
   * Updated the Job document associated with jobId with the given jobStatus
   *
   * @param jobId	provides input
   * @param jobStatus	provides input
   * 
   */
    void finishJob(String jobId, String jobStatus);

  /**
   * 
   *
   * @param endpointConstants	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode findStepResponses(com.fasterxml.jackson.databind.JsonNode endpointConstants);

}
