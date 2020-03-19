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
package com.marklogic.hub.oneui.managers;

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
import com.marklogic.hub.oneui.exceptions.BadRequestException;
import com.marklogic.hub.oneui.models.SJSSearchQuery;
import com.marklogic.hub.oneui.models.MapSearchQuery;

import javax.xml.namespace.QName;
import java.util.ArrayList;

public class MapSearchManager extends MapSearchableManager {

    private HubConfig hubConfig;
    private QueryManager stagingQueryMgr;
    private QueryManager finalQueryMgr;
    private GenericDocumentManager stagingDocMgr;
    private GenericDocumentManager finalDocMgr;

    public MapSearchManager(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        DatabaseClient stagingClient = hubConfig.newStagingClient();
        DatabaseClient finalClient = hubConfig.newFinalClient();
        this.stagingQueryMgr = stagingClient.newQueryManager();
        this.stagingDocMgr = stagingClient.newDocumentManager();
        this.finalQueryMgr = finalClient.newQueryManager();
        this.finalDocMgr = finalClient.newDocumentManager();
    }

    public StringHandle search(MapSearchQuery mapSearchQuery) {
        QueryManager queryMgr;
        String dbPrefix;
        if (mapSearchQuery.database.equalsIgnoreCase(DatabaseKind.getName(DatabaseKind.STAGING))) {
            queryMgr = stagingQueryMgr;
            dbPrefix = "staging-";
        }
        else {
            queryMgr = finalQueryMgr;
            dbPrefix = "final-";
        }

        queryMgr.setPageLength(mapSearchQuery.count);

        StructuredQueryBuilder sb;

        ArrayList<StructuredQueryDefinition> queries = new ArrayList<>();

        if (mapSearchQuery.entitiesOnly) {
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

        if (mapSearchQuery.facets != null) {
            mapSearchQuery.facets.entrySet().forEach(entry -> entry.getValue().forEach(value -> {
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
        sqd.setCriteria(mapSearchQuery.query);

        StringHandle sh = new StringHandle();
        sh.setFormat(Format.JSON);
        return queryMgr.search(sqd, sh, mapSearchQuery.start);
    }

    public JsonNode sjsSearch(SJSSearchQuery SJSSearchQuery) {
        if (SJSSearchQuery.sourceQuery == null && SJSSearchQuery.database == null) {
            throw new BadRequestException("Query requires database or sourceQuery");
        }

        Collections collections = new Collections(hubConfig.newStagingClient());
        return collections.getCollections(SJSSearchQuery.sourceQuery, String.valueOf(SJSSearchQuery.count), SJSSearchQuery.database, String.valueOf(SJSSearchQuery.urisOnly));
    }

    public String getDoc(String database, String docUri) {
        GenericDocumentManager docMgr;
        if (database.equalsIgnoreCase(DatabaseKind.getName(DatabaseKind.STAGING))) {
            docMgr = stagingDocMgr;
        }
        else {
            docMgr = finalDocMgr;
        }
        return docMgr.readAs(docUri, String.class, new ServerTransform("mlPrettifyXML"));
    }

    public class Collections extends ResourceManager {
        private static final String NAME = "mlCollections";

        private RequestParameters params;

        public Collections(DatabaseClient client) {
            super();
            client.init(NAME, this);
            params = new RequestParameters();
        }

        public JsonNode getCollections(String sourceQuery, String count, String databaseName, String urisOnly) {
            params.add("sourceQuery", sourceQuery);
            params.add("count", count);
            params.add("database", databaseName);
            params.add("urisOnly", urisOnly);

            ResourceServices.ServiceResultIterator resultItr = this.getServices().get(params);
            if (resultItr == null || !resultItr.hasNext()) {
                throw new RuntimeException("Unable to get documents");
            }
            ResourceServices.ServiceResult res = resultItr.next();
            return res.getContent(new JacksonHandle()).get();
        }
    }
}
