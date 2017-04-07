/*
 * Copyright 2012-2016 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.quickstart.model.TraceQuery;

import java.util.ArrayList;

public class TraceService extends SearchableService {

    private static final String SEARCH_OPTIONS_NAME = "traces";

    private QueryManager queryMgr;
    private GenericDocumentManager docMgr;

    public TraceService(DatabaseClient client) {
        DatabaseClient databaseClient = client;
        this.queryMgr = databaseClient.newQueryManager();
        this.docMgr = databaseClient.newDocumentManager();
    }


    public StringHandle getTraces(TraceQuery traceQuery) {
        queryMgr.setPageLength(traceQuery.count);

        StructuredQueryBuilder sb = queryMgr.newStructuredQueryBuilder(SEARCH_OPTIONS_NAME);

        ArrayList<StructuredQueryDefinition> queries = new ArrayList<>();
        if (traceQuery.query != null && !traceQuery.query.equals("")) {
            queries.add(sb.term(traceQuery.query));
        }

        StructuredQueryDefinition def = addRangeConstraint(sb, "identifier", traceQuery.identifier);
        if (def != null) {
            queries.add(def);
        }

        def = addRangeConstraint(sb, "jobId", traceQuery.jobId);
        if (def != null) {
            queries.add(def);
        }

        if (traceQuery.hasError != null) {
            def = addRangeConstraint(sb, "hasError", Boolean.toString(traceQuery.hasError));
            if (def != null) {
                queries.add(def);
            }
        }

        def = addRangeConstraint(sb, "flowType", traceQuery.flowType);
        if (def != null) {
            queries.add(def);
        }

        StructuredQueryDefinition sqd = sb.and(queries.toArray(new StructuredQueryDefinition[0]));

        String searchXml = sqd.serialize();

        RawCombinedQueryDefinition querydef = queryMgr.newRawCombinedQueryDefinition(new StringHandle(searchXml), SEARCH_OPTIONS_NAME);
        querydef.setResponseTransform(new ServerTransform("trace-search"));
        StringHandle sh = new StringHandle();
        sh.setFormat(Format.JSON);
        return queryMgr.search(querydef, sh, traceQuery.start);
    }

    public JsonNode getTrace(String traceId) {
        return docMgr.readAs("/" + traceId, JsonNode.class, new ServerTransform("trace-json"));
    }
}
