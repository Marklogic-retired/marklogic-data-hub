package com.marklogic.hub.dataservices;

// IMPORTANT: Do not edit. This file is generated.

import com.marklogic.client.SessionState;
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

            private BaseProxy.DBFunctionRequest req_pruneProvenance;

            private ProvenanceServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/provenance/", servDecl);

                this.req_pruneProvenance = this.baseProxy.request(
                    "pruneProvenance.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_NODES);
            }
            @Override
            public SessionState newSessionState() {
              return baseProxy.newSessionState();
            }

            @Override
            public Reader pruneProvenance(SessionState session, Reader endpointState, Reader endpointConstants) {
                return pruneProvenance(
                    this.req_pruneProvenance.on(this.dbClient), session, endpointState, endpointConstants
                    );
            }
            private Reader pruneProvenance(BaseProxy.DBFunctionRequest request, SessionState session, Reader endpointState, Reader endpointConstants) {
              return BaseProxy.JsonDocumentType.toReader(
                request
                      .withSession("session", session, true)
                      .withParams(
                          BaseProxy.documentParam("endpointState", true, BaseProxy.ObjectType.fromReader(endpointState)),
                          BaseProxy.documentParam("endpointConstants", true, BaseProxy.ObjectType.fromReader(endpointConstants))
                          ).responseSingle(true, Format.JSON)
                );
            }
        }

        return new ProvenanceServiceImpl(db, serviceDeclaration);
    }
    /**
     * Creates an object to track a session for a set of operations
     * that require session state on the database server.
     *
     * @return	an object for session state
     */
    SessionState newSessionState();

  /**
   * Prunes provenance according to the retainDuration property provided in endpointConstants.
   *
   * @param session	provides input
   * @param endpointState	provides input
   * @param endpointConstants	provides input
   * @return	as output
   */
    Reader pruneProvenance(SessionState session, Reader endpointState, Reader endpointConstants);

}
