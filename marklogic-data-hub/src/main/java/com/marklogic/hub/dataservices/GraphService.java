package com.marklogic.hub.dataservices;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.impl.BaseProxy;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.marker.JSONWriteHandle;

public interface GraphService {

    static GraphService on(DatabaseClient db) {
        return on(db, null);
    }

    static GraphService on(DatabaseClient db, JSONWriteHandle serviceDeclaration) {
        final class GraphServiceImpl implements GraphService {
            private DatabaseClient dbClient;
            private BaseProxy baseProxy;

            private BaseProxy.DBFunctionRequest req_searchNodes;
            private BaseProxy.DBFunctionRequest req_nodeExpand;

            private GraphServiceImpl(DatabaseClient dbClient, JSONWriteHandle servDecl) {
                this.dbClient  = dbClient;
                this.baseProxy = new BaseProxy("/data-hub/5/data-services/graph/", servDecl);

                this.req_searchNodes = this.baseProxy.request(
                    "searchNodes.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);
                this.req_nodeExpand = this.baseProxy.request(
                    "nodeExpand.sjs", BaseProxy.ParameterValuesKind.MULTIPLE_MIXED);

            }

            @Override
            public JsonNode searchNodes(JsonNode searchQuery, String structuredQuery, String queryOptions) {
                return searchNodes(
                    this.req_searchNodes.on(this.dbClient), searchQuery,  structuredQuery, queryOptions
                );
            }
            private JsonNode searchNodes(BaseProxy.DBFunctionRequest request, JsonNode searchQuery, String structuredQuery, String queryOptions) {
                return BaseProxy.JsonDocumentType.toJsonNode(
                    request
                        .withParams(
                            BaseProxy.documentParam("query", true, BaseProxy.JsonDocumentType.fromJsonNode(searchQuery.get("query"))),
                            BaseProxy.atomicParam("start", true, BaseProxy.StringType.fromString(searchQuery.get("start").toString())),
                            BaseProxy.atomicParam("pageLength", true, BaseProxy.StringType.fromString(searchQuery.get("pageLength").toString())),
                            BaseProxy.atomicParam("structuredQuery", true, BaseProxy.StringType.fromString(structuredQuery)),
                            BaseProxy.atomicParam("queryOptions", true, BaseProxy.StringType.fromString(queryOptions))
                        ).responseSingle(false, Format.JSON)
                );
            }

            @Override
            public JsonNode nodeExpand(JsonNode nodeInfo, Integer limit) {
                return nodeExpand(
                    this.req_nodeExpand.on(this.dbClient), nodeInfo, limit
                );
            }
            private JsonNode nodeExpand(BaseProxy.DBFunctionRequest request, JsonNode nodeInfo, Integer limit) {
                return BaseProxy.JsonDocumentType.toJsonNode(
                    request
                        .withParams(
                            BaseProxy.documentParam("nodeInfo", true, BaseProxy.JsonDocumentType.fromJsonNode(nodeInfo)),
                            BaseProxy.atomicParam("limit", true, BaseProxy.IntegerType.fromInteger(limit))
                        ).responseSingle(false, Format.JSON)
                );
            }
        }

        return new GraphServiceImpl(db, serviceDeclaration);
    }

    JsonNode searchNodes(JsonNode searchQuery, String structuredQuery, String queryOptions);
    JsonNode nodeExpand(JsonNode nodeInfo, Integer limit);
}
