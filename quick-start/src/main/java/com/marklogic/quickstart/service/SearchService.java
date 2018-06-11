/*
 * Copyright 2012-2018 MarkLogic Corporation
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
package com.marklogic.quickstart.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.quickstart.model.SearchQuery;

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
        DatabaseClient stagingClient = hubConfig.newStagingManageClient();
        DatabaseClient finalClient = hubConfig.newFinalManageClient();
        this.stagingQueryMgr = stagingClient.newQueryManager();
        this.stagingDocMgr = stagingClient.newDocumentManager();
        this.finalQueryMgr = finalClient.newQueryManager();
        this.finalDocMgr = finalClient.newDocumentManager();
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
                }
                else {
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
}
