package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.io.Format;
import java.io.Reader;


import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.marker.JSONWriteHandle;

import com.marklogic.client.impl.BaseProxy;

/**
 * Defines endpoints for viewing and managing provenance documents
 */
public interface ProvenanceService {
    /**
     * Creates a ProvenanceService object for executing operations on the database server.
     *
     * The DatabaseClientFactory class can create the DatabaseClient parameter. A single
     * client object can be used for any number of requests and in multiple threads.
     *
     * @param db	provides a client for communicating with the database server
     * @return	an object for executing database operations
     */
    static ProvenanceService on(DatabaseClient db) {
      return on(db, null);
    }
    /**
     * Creates a ProvenanceService object for executing operations on the database server.
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
    static ProvenanceService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class ProvenanceServiceImpl implements ProvenanceService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_getProvenanceGraph;
            private BaseProxy.DBFunctionRequest req_migrateProvenance;
            private BaseProxy.DBFunctionRequest req_deleteProvenance;

            private ProvenanceServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/provenance/", servDecl);

                this.req_getProvenanceGraph = this.baseProxy.request(
                    "getProvenanceGraph.sjs", BaseProxy.ParameterValuesKind.SINGLE_ATOMIC);
                this.req_migrateProvenance = this.baseProxy.request(
                    "migrateProvenance.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_NODES);
                this.req_deleteProvenance = this.baseProxy.request(
                    "deleteProvenance.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_NODES);
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode getProvenanceGraph(String documentURI) {
                return getProvenanceGraph(
                    this.req_getProvenanceGraph.on(this.dbClient), documentURI
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode getProvenanceGraph(BaseProxy.DBFunctionRequest request, String documentURI) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.atomicParam("documentURI", true, BaseProxy.StringType.fromString(documentURI))
                          ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode migrateProvenance(Reader endpointState, Reader endpointConstants) {
                return migrateProvenance(
                    this.req_migrateProvenance.on(this.dbClient), endpointState, endpointConstants
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode migrateProvenance(BaseProxy.DBFunctionRequest request, Reader endpointState, Reader endpointConstants) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("endpointState", true, BaseProxy.JsonDocumentType.fromReader(endpointState)),
                          BaseProxy.documentParam("endpointConstants", false, BaseProxy.JsonDocumentType.fromReader(endpointConstants))
                          ).responseSingle(true, Format.JSON)
                );
            }

            @Override
            public com.fasterxml.jackson.databind.JsonNode deleteProvenance(Reader endpointState, Reader endpointConstants) {
                return deleteProvenance(
                    this.req_deleteProvenance.on(this.dbClient), endpointState, endpointConstants
                    );
            }
            private com.fasterxml.jackson.databind.JsonNode deleteProvenance(BaseProxy.DBFunctionRequest request, Reader endpointState, Reader endpointConstants) {
              return BaseProxy.JsonDocumentType.toJsonNode(
                request
                      .withParams(
                          BaseProxy.documentParam("endpointState", true, BaseProxy.JsonDocumentType.fromReader(endpointState)),
                          BaseProxy.documentParam("endpointConstants", false, BaseProxy.JsonDocumentType.fromReader(endpointConstants))
                          ).responseSingle(true, Format.JSON)
                );
            }
        }

        return new ProvenanceServiceImpl(db, serviceDeclaration);
    }

  /**
   * Returns a JSON Object contain Provenance nodes and links. Requires either docURI or jobID to be provided.
   *
   * @param documentURI	The documentURI that you wish to get provenance data about.
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode getProvenanceGraph(String documentURI);

  /**
   * Migrates provenance to provenance format starting in DH 5.7.
   *
   * @param endpointState	provides input
   * @param endpointConstants	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode migrateProvenance(Reader endpointState, Reader endpointConstants);

  /**
   * Deletes provenance according to the retainDuration property provided in endpointConstants.
   *
   * @param endpointState	provides input
   * @param endpointConstants	provides input
   * @return	as output
   */
    com.fasterxml.jackson.databind.JsonNode deleteProvenance(Reader endpointState, Reader endpointConstants);

}
