/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.web.exception.BadRequestException;
import com.marklogic.hub.web.model.SJSSearchQuery;
import com.marklogic.hub.web.model.SearchQuery;

import javax.xml.namespace.QName;
import java.util.ArrayList;

public class SearchService extends SearchableService {

    private HubConfig hubConfig;
    private QueryManager stagingQueryMgr;
    private QueryManager finalQueryMgr;
    private GenericDocumentManager stagingDocMgr;
    private GenericDocumentManager finalDocMgr;

    public SearchService(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        DatabaseClient stagingClient = hubConfig.newStagingClient();
        DatabaseClient reverseFlowClient = hubConfig.newReverseFlowClient();
        DatabaseClient finalClient = hubConfig.newFinalClient();
        this.stagingQueryMgr = stagingClient.newQueryManager();
        this.stagingDocMgr = stagingClient.newDocumentManager();
        this.finalQueryMgr = finalClient.newQueryManager();
        // since this call uses a DHF enode transform, it needs the staging modules database
        // FIXME use one modules database to remove this nonsense.
        this.finalDocMgr = reverseFlowClient.newDocumentManager();
    }

    public StringHandle search(SearchQuery searchQuery) {
        QueryManager queryMgr;
        String dbPrefix;
        if (searchQuery.database.equalsIgnoreCase(DatabaseKind.getName(DatabaseKind.STAGING))) {
            queryMgr = stagingQueryMgr;
            dbPrefix = "staging-";
        }
        else {
            queryMgr = finalQueryMgr;
            dbPrefix = "final-";
        }

        queryMgr.setPageLength(searchQuery.count);

        StructuredQueryBuilder sb;

        ArrayList<StructuredQueryDefinition> queries = new ArrayList<>();

        if (searchQuery.entitiesOnly) {
            sb = queryMgr.newStructuredQueryBuilder(dbPrefix + "entity-options");
            queries.add(
                sb.or(
                    sb.containerQuery(sb.element(new QName("http://marklogic.com/entity-services", "instance")), sb.and()),
                    sb.containerQuery(sb.jsonProperty("instance"), sb.and())
                )
            );
        }
        else {
            sb = queryMgr.newStructuredQueryBuilder("default");
        }

        if (searchQuery.facets != null) {
            searchQuery.facets.entrySet().forEach(entry -> entry.getValue().forEach(value -> {
                StructuredQueryDefinition def;

                if (entry.getKey().equals("Collection")) {
                    def = sb.collectionConstraint(entry.getKey(), value);
                } else if ("createdByJob".equals(entry.getKey())) {
                    def = sb.wordConstraint(entry.getKey(), value);
                } else if ("createdByStep".equals(entry.getKey())) {
                    def = sb.wordConstraint(entry.getKey(), value);
                } else {
                    def = addRangeConstraint(sb, entry.getKey(), value);
                }

                if (def != null) {
                    queries.add(def);
                }
            }));
        }

        StructuredQueryDefinition sqd = sb.and(queries.toArray(new StructuredQueryDefinition[0]));
        sqd.setCriteria(searchQuery.query);

        StringHandle sh = new StringHandle();
        sh.setFormat(Format.JSON);
        return queryMgr.search(sqd, sh, searchQuery.start);
    }

    public JsonNode sjsSearch(SJSSearchQuery SJSSearchQuery) {
        if (SJSSearchQuery.sourceQuery == null && SJSSearchQuery.database == null) {
            throw new BadRequestException();
        }

        Collections collections = new Collections(hubConfig.newStagingClient());
        return collections.getCollections(SJSSearchQuery.sourceQuery, String.valueOf(SJSSearchQuery.count), SJSSearchQuery.database);
    }

    public String getDoc(String database, String docUri) {
        GenericDocumentManager docMgr;
        if (database.equalsIgnoreCase(DatabaseKind.getName(DatabaseKind.STAGING))) {
            docMgr = stagingDocMgr;
        }
        else {
            docMgr = finalDocMgr;
        }
        return docMgr.readAs(docUri, String.class, new ServerTransform("ml:prettifyXML"));
    }

    public class Collections extends ResourceManager {
        private static final String NAME = "ml:collections";

        private RequestParameters params;

        public Collections(DatabaseClient client) {
            super();
            client.init(NAME, this);
            params = new RequestParameters();
        }

        public JsonNode getCollections(String sourceQuery, String count, String databaseName) {
            params.add("sourceQuery", sourceQuery);
            params.add("count", count);
            params.add("database", databaseName);

            ResourceServices.ServiceResultIterator resultItr = this.getServices().get(params);
            if (resultItr == null || !resultItr.hasNext()) {
                throw new RuntimeException("Unable to get documents");
            }
            ResourceServices.ServiceResult res = resultItr.next();
            return res.getContent(new JacksonHandle()).get();
        }
    }
}
