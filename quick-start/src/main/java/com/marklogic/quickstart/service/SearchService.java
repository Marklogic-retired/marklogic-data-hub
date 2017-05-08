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

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubDatabase;
import com.marklogic.quickstart.model.SearchQuery;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import javax.xml.namespace.QName;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.SAXParser;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
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
        DatabaseClient finalClient = hubConfig.newFinalClient();
        this.stagingQueryMgr = stagingClient.newQueryManager();
        this.stagingDocMgr = stagingClient.newDocumentManager();
        this.finalQueryMgr = finalClient.newQueryManager();
        this.finalDocMgr = finalClient.newDocumentManager();
    }

    private Element getOptions(boolean entitiesOnly) {
        try {
            Path dir = Paths.get(hubConfig.projectDir, HubConfig.ENTITY_CONFIG_DIR, HubConfig.ENTITY_SEARCH_OPTIONS_FILE);
            if (dir.toFile().exists()) {
                DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
                dbf.setNamespaceAware(true);
                DocumentBuilder db = dbf.newDocumentBuilder();
                Document doc = db.parse(dir.toFile());
                Element root = doc.getDocumentElement();

                if (entitiesOnly) {
                    String additionalQuery = "<search:additional-query xmlns:search=\"http://marklogic.com/appservices/search\">\n" +
                        "  <cts:or-query xmlns:cts=\"http://marklogic.com/cts\">\n" +
                        "    <cts:element-query>\n" +
                        "      <cts:element xmlns:es=\"http://marklogic.com/entity-services\">es:instance</cts:element>\n" +
                        "      <cts:true-query/>\n" +
                        "    </cts:element-query>\n" +
                        "    <cts:json-property-scope-query>\n" +
                        "      <cts:property>instance</cts:property>\n" +
                        "      <cts:true-query/>\n" +
                        "    </cts:json-property-scope-query>\n" +
                        "  </cts:or-query>\n" +
                        "</search:additional-query>";
                    Element e = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new ByteArrayInputStream(additionalQuery.getBytes(StandardCharsets.UTF_8))).getDocumentElement();
                    Node n = doc.importNode(e, true);
                    root.appendChild(n);
                }
                return root;
            }
        }
        catch (Exception e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    public StringHandle search(SearchQuery searchQuery) {
        QueryManager queryMgr;
        if (searchQuery.database.equals(HubDatabase.STAGING)) {
            queryMgr = stagingQueryMgr;
        }
        else {
            queryMgr = finalQueryMgr;
        }

        queryMgr.setPageLength(searchQuery.count);

        StructuredQueryBuilder sb;

        ArrayList<StructuredQueryDefinition> queries = new ArrayList<>();

        if (searchQuery.entitiesOnly) {
            sb = queryMgr.newStructuredQueryBuilder("entity-options");
            queries.add(
                sb.or(
                    sb.containerQuery(sb.element(new QName("http://marklogic.com/entity-services", "instance")), sb.and(null)),
                    sb.containerQuery(sb.jsonProperty("instance"), sb.and(null))
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

    public String getDoc(HubDatabase database, String docUri) {
        GenericDocumentManager docMgr;
        if (database.equals(HubDatabase.STAGING)) {
            docMgr = stagingDocMgr;
        }
        else {
            docMgr = finalDocMgr;
        }
        return docMgr.readAs(docUri, String.class, new ServerTransform("prettify"));
    }
}
