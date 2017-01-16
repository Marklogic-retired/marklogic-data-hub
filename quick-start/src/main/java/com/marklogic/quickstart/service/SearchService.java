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
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubDatabase;
import com.marklogic.hub.util.PerformanceLogger;
import com.marklogic.quickstart.model.SearchQuery;
import com.marklogic.quickstart.util.QueryHelper;
import org.codehaus.jettison.json.JSONObject;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
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
            Path dir = Paths.get(hubConfig.projectDir, HubConfig.USER_CONFIG_DIR, HubConfig.SEARCH_OPTIONS_FILE);
            if (dir.toFile().exists()) {
                DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
                DocumentBuilder db = dbf.newDocumentBuilder();
                Document doc = db.parse(dir.toFile());
                Element root = doc.getDocumentElement();

                if (entitiesOnly) {
                    String additionalQuery = "<additional-query xmlns=\"http://marklogic.com/appservices/search\">\n" +
                        "      <cts:element-query xmlns:cts=\"http://marklogic.com/cts\">\n" +
                        "      <cts:element xmlns:es=\"http://marklogic.com/entity-services\">es:instance</cts:element>\n" +
                        "      <cts:true-query/>\n" +
                        "      </cts:element-query>\n" +
                        "    </additional-query>";
                    Node n = doc.importNode(db.parse(new ByteArrayInputStream(additionalQuery.getBytes(StandardCharsets.UTF_8))).getDocumentElement(), true);
                    root.appendChild(n);
                }
            }
        }
        catch (Exception e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    public StringHandle search(SearchQuery searchQuery) {

        long startTime = PerformanceLogger.monitorTimeInsideMethod();
        QueryManager queryMgr;
        if (searchQuery.database.equals(HubDatabase.STAGING)) {
            queryMgr = stagingQueryMgr;
        }
        else {
            queryMgr = finalQueryMgr;
        }

        queryMgr.setPageLength(searchQuery.count);

        StructuredQueryBuilder sb = queryMgr.newStructuredQueryBuilder();

        ArrayList<StructuredQueryDefinition> queries = new ArrayList<>();

        if (searchQuery.facets != null) {
            searchQuery.facets.entrySet().forEach(entry -> entry.getValue().forEach(value -> {
                StructuredQueryDefinition def = addRangeConstraint(sb, entry.getKey(), value);
                if (def != null) {
                    queries.add(def);
                }
            }));
        }

        StructuredQueryBuilder.AndQuery sqd = sb.and(queries.toArray(new StructuredQueryDefinition[0]));
        sqd.setCriteria(searchQuery.query);

        String searchXml = QueryHelper.serializeQuery(sb, sqd, searchQuery.sort, getOptions(searchQuery.entitiesOnly));
        logger.info(searchXml);
        RawCombinedQueryDefinition querydef = queryMgr.newRawCombinedQueryDefinitionAs(Format.XML, searchXml);

        StringHandle sh = new StringHandle();
        sh.setFormat(Format.JSON);
        StringHandle results = queryMgr.search(querydef, sh, searchQuery.start);
        PerformanceLogger.logTimeInsideMethod(startTime, "SearchService.search()");
        return results;
    }

    public String getDoc(HubDatabase database, String docUri) {
        GenericDocumentManager docMgr;
        if (database.equals(HubDatabase.STAGING)) {
            docMgr = stagingDocMgr;
        }
        else {
            docMgr = finalDocMgr;
        }
        return "{\"doc\": " + JSONObject.quote(docMgr.readAs(docUri, String.class)) + "}";
    }
}
