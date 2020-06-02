/*
 * Copyright 2012-2020 MarkLogic Corporation
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
package com.marklogic.hub.central.entities.search;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ForbiddenUserException;
import com.marklogic.client.MarkLogicServerException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.ReaderHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.io.marker.StructureWriteHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.client.row.RowManager;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.central.entities.search.impl.CollectionFacetHandler;
import com.marklogic.hub.central.entities.search.impl.CreatedOnFacetHandler;
import com.marklogic.hub.central.entities.search.impl.EntityPropertyFacetHandler;
import com.marklogic.hub.central.entities.search.impl.JobRangeFacetHandler;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;
import com.marklogic.hub.central.entities.search.models.Document;
import com.marklogic.hub.central.entities.search.models.SearchQuery;
import com.marklogic.hub.central.exceptions.DataHubException;
import com.marklogic.hub.central.managers.ModelManager;
import com.marklogic.hub.dataservices.EntitySearchService;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.StringEscapeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class EntitySearchManager {

    private static final String MASTERING_AUDIT_COLLECTION_NAME = "mdm-auditing";
    private static final String[] IGNORED_SM_COLLECTION_SUFFIX = {"auditing", "notification"};

    private static final String SEARCH_HEAD = "<search xmlns=\"http://marklogic.com/appservices/search\">\n";
    private static final String SEARCH_TAIL = "</search>";
    private static final Set<String> METADATA_FIELD_NAME = new HashSet<>(Arrays.asList("datahubCreatedOn"));
    private static final String CSV_CONTENT_TYPE = "text/csv";
    private static final String CSV_FILE_EXTENSION = ".csv";
    private static final String SEPARATOR = "_";
    private static final String FILE_PREFIX = "DH_Export_";

    private static final Logger logger = LoggerFactory.getLogger(EntitySearchManager.class);

    public static String QUERY_OPTIONS = "exp-final-entity-options";
    private static Map<String, FacetHandler> facetHandlerMap;
    private DatabaseClient finalDatabaseClient;
    private ModelManager modelManager;

    public EntitySearchManager(HubClient hubClient) {
        this.finalDatabaseClient = hubClient.getFinalClient();
        this.modelManager = new ModelManager(hubClient);
        initializeFacetHandlerMap();
    }

    public StringHandle search(SearchQuery searchQuery) {
        QueryManager queryMgr = finalDatabaseClient.newQueryManager();

        // Setting criteria and searching
        StringHandle resultHandle = new StringHandle();
        resultHandle.setFormat(Format.JSON);
        try {
            //buildQuery includes datetime conversion which could cause DateTimeException or DateTimeParseException
            StructuredQueryDefinition queryDef = buildQuery(queryMgr, searchQuery);
            String query = queryDef.serialize();
            StructureWriteHandle handle = new StringHandle(buildSearchOptions(query, searchQuery)).withMimetype("application/xml");
            RawCombinedQueryDefinition rcQueryDef = queryMgr.newRawCombinedQueryDefinition(handle, queryDef.getOptionsName());

            // If an entity has been selected, then apply this transform
            String[] entityTypeCollections = searchQuery.getQuery().getEntityTypeCollections();
            if (entityTypeCollections != null && entityTypeCollections.length > 0) {
                // We have some awkwardness here where the input is 'entityName', but as of 5.3.0, the "entityTypeIds"
                // property is capturing entity names, which are expected to double as collection names as well
                rcQueryDef.setResponseTransform(new ServerTransform("hubEntitySearchTransform")
                    .addParameter("entityName", entityTypeCollections[0]));
            }

            return queryMgr.search(rcQueryDef, resultHandle, searchQuery.getStart());
        }
        catch (MarkLogicServerException e) {
            // If there are no entityModels to search, then we expect an error because no search options will exist
            if (searchQuery.getQuery().getEntityTypeIds().isEmpty() || modelManager.getModels().size() == 0) {
                logger.warn("No entityTypes present to perform search");
                return new StringHandle("");
            }

            logger.error(e.getLocalizedMessage());

            // Resorting to string contains check as there isn't any other discernible difference
            if (e.getLocalizedMessage().contains(QUERY_OPTIONS)) {
                logger.error("If this is a configuration issue, fix the configuration issues as shown in"
                        + " the logs for enabling faceted search on the entity properties."
                        + "\n"
                        + "If the " + QUERY_OPTIONS
                        + " search options file is missing, please look into documentation "
                        + "for creating the options file. If the database is indexing then it might take some "
                        + "time for the file to get generated. This file is required to enable "
                        + "various search features.");
            }

            throw new DataHubException(e.getServerMessage(), e);
        }
        catch (Exception e) { //other runtime exceptions
            throw new DataHubException(e.getLocalizedMessage(), e);
        }
    }

    public Optional<Document> getDocument(String docUri) {
        GenericDocumentManager docMgr = finalDatabaseClient.newDocumentManager();
        DocumentMetadataHandle documentMetadataReadHandle = new DocumentMetadataHandle();

        // Fetching document content and meta-data
        try {
            String content = docMgr.readAs(docUri, documentMetadataReadHandle, String.class);
            Map<String, String> metadata = documentMetadataReadHandle.getMetadataValues();
            return Optional.ofNullable(new Document(content, metadata));
        }
        catch (MarkLogicServerException e) {
            if (e instanceof ResourceNotFoundException || e instanceof ForbiddenUserException) {
                logger.warn(e.getLocalizedMessage());
            }
            else { //FailedRequestException || ResourceNotResendableException
                logger.error(e.getLocalizedMessage());
            }
            throw new DataHubException(e.getServerMessage(), e);
        }
        catch (Exception e) { //other runtime exceptions
            throw new DataHubException(e.getLocalizedMessage(), e);
        }
    }

    private StructuredQueryDefinition buildQuery(QueryManager queryMgr, SearchQuery searchQuery) {
        queryMgr.setPageLength(searchQuery.getPageLength());
        StructuredQueryBuilder queryBuilder = queryMgr.newStructuredQueryBuilder(QUERY_OPTIONS);

        // Creating queries object
        List<StructuredQueryDefinition> queries = new ArrayList<>();

        final String[] entityTypeCollections = searchQuery.getQuery().getEntityTypeCollections();

        // Filtering search results for docs related to an entity
        if (entityTypeCollections != null && entityTypeCollections.length > 0) {
            // Collections that have the mastering audit and notification docs. Excluding docs from
            // these collection in search results
            String[] excludedCollections = getExcludedCollections(
                    searchQuery.getQuery().getEntityTypeIds());

            StructuredQueryDefinition finalCollQuery = queryBuilder
                    .andNot(queryBuilder.collection(entityTypeCollections),
                            queryBuilder.collection(excludedCollections));

            queries.add(finalCollQuery);
        }
        else { // If entity-model collections are empty, don't return any documents
            StructuredQueryDefinition finalCollQuery = queryBuilder.and(queryBuilder.collection());
            queries.add(finalCollQuery);
        }

        // Filtering by facets
        searchQuery.getQuery().getSelectedFacets().forEach((facetType, data) -> {
            // If a property is not a Hub property, then it is an Entity Property
            StructuredQueryDefinition facetDef = facetHandlerMap.getOrDefault(facetType, new EntityPropertyFacetHandler(facetType))
                    .buildQuery(data, queryBuilder);

            if (facetDef != null) {
                queries.add(facetDef);
            }
        });

        // And between all the queries
        return queryBuilder
                .and(queries.toArray(new StructuredQueryDefinition[0]));
    }

    private void initializeFacetHandlerMap() {
        facetHandlerMap = new HashMap<>();
        facetHandlerMap.put(Constants.COLLECTION_CONSTRAINT_NAME, new CollectionFacetHandler());
        facetHandlerMap.put(Constants.JOB_RANGE_CONSTRAINT_NAME, new JobRangeFacetHandler());
        facetHandlerMap.put(Constants.CREATED_ON_CONSTRAINT_NAME, new CreatedOnFacetHandler());
    }

    private String[] getExcludedCollections(List<String> entityNames) {
        List<String> excludedCol = new ArrayList<>();
        entityNames.forEach(name -> {
            for (String suffix : IGNORED_SM_COLLECTION_SUFFIX) {
                excludedCol.add(String.format("sm-%s-%s", name, suffix));
            }
        });
        excludedCol.add(MASTERING_AUDIT_COLLECTION_NAME);
        return excludedCol.toArray(new String[0]);
    }

    protected String buildSearchOptions(String query, SearchQuery searchQuery) {
        StringBuilder sb = new StringBuilder();
        sb.append(SEARCH_HEAD);

        //build sort order options
        buildSortOrderOptions(sb, searchQuery);
        // Setting search string if provided by user
        if (StringUtils.isNotEmpty(searchQuery.getQuery().getSearchText())) {
            sb.append("<qtext>").append(StringEscapeUtils.escapeXml10(searchQuery.getQuery().getSearchText())).append("</qtext>");
        }
        sb.append(query);
        sb.append(SEARCH_TAIL);

        logger.debug(String.format("Search options: \n %s", sb.toString()));
        return sb.toString();
    }

    public void exportById(String queryId, String fileType, Long limit, OutputStream out, HttpServletResponse response) {
        JsonNode queryDocument = EntitySearchService.on(finalDatabaseClient).getSavedQuery(queryId);
        exportByQuery(queryDocument, fileType, limit, out, response);
    }

    public void exportByQuery(JsonNode queryDocument, String fileType, Long limit, OutputStream out, HttpServletResponse response) {
        if ("CSV".equals(fileType.toUpperCase())) {
            prepareResponseHeader(response, CSV_CONTENT_TYPE, getFileNameForDownload(queryDocument, CSV_FILE_EXTENSION));
            exportRows(queryDocument, limit, out);
        }
        else {
            throw new DataHubException("Invalid file type: " + fileType);
        }
    }

    public void exportRows(JsonNode queryDocument, Long limit, OutputStream out) {
        QueryManager queryMgr = finalDatabaseClient.newQueryManager();
        SearchQuery searchQuery = transformToSearchQuery(queryDocument);
        StructuredQueryDefinition structuredQueryDefinition = buildQuery(queryMgr, searchQuery);

        String structuredQuery = structuredQueryDefinition.serialize();
        String searchText = searchQuery.getQuery().getSearchText();
        String queryOptions = getQueryOptions(QUERY_OPTIONS);
        String entityTypeId = getEntityTypeIdForRowExport(queryDocument);
        List<String> columns = getColumnNamesForRowExport(queryDocument);

        JsonNode opticPlanNode = EntitySearchService.on(finalDatabaseClient).getOpticPlan(structuredQuery, searchText, queryOptions, entityTypeId, entityTypeId, limit, columns.stream());
        StringHandle stringHandle = new StringHandle(opticPlanNode.toString());
        RowManager rowManager = finalDatabaseClient.newRowManager();
        try (ReaderHandle readerHandle = new ReaderHandle()) {
            rowManager.resultDoc(rowManager.newRawPlanDefinition(stringHandle), readerHandle.withMimetype(CSV_CONTENT_TYPE));
            readerHandle.write(out);
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
        finally {
            IOUtils.closeQuietly(out);
        }
    }

    protected SearchQuery transformToSearchQuery(JsonNode queryDocument) {
        return Optional.of(queryDocument)
                .map(node -> node.get("savedQuery"))
                .map(node -> node.get("query"))
                .map(node -> {
                    try {
                        return new ObjectMapper().treeToValue(node, DocSearchQueryInfo.class);
                    }
                    catch (JsonProcessingException e) {
                        throw new DataHubException("Invalid query");
                    }
                })
                .map(docSearchQueryInfo -> {
                    final SearchQuery query = new SearchQuery();
                    query.setQuery(docSearchQueryInfo);
                    return query;
                })
                .orElseThrow(() -> new DataHubException("Valid query required"));
    }

    protected String getEntityTypeIdForRowExport(JsonNode queryDocument) {
        return Optional.of(queryDocument)
                .map(node -> node.get("savedQuery"))
                .map(node -> node.get("query"))
                .map(node -> node.get("entityTypeIds"))
                .map(node -> node.get(0))
                .map(JsonNode::textValue)
                .orElse(null);
    }

    protected List<String> getColumnNamesForRowExport(JsonNode queryDocument) {
        List<String> columns = new ArrayList<>();
        Optional.of(queryDocument)
                .map(node -> node.get("savedQuery"))
                .map(node -> node.get("propertiesToDisplay"))
                .ifPresent(node -> node.forEach(colNode -> columns.add(colNode.textValue())));
        return columns;
    }

    /*
     * Returns null when 'name' is missing or blank ("")
     */
    protected String getQueryName(JsonNode queryDocument) {
        return Optional.of(queryDocument)
                .map(node -> node.get("savedQuery"))
                .map(node -> node.get("name"))
                .map(JsonNode::textValue)
                .filter(StringUtils::isNotBlank)
                .orElse(null);
    }

    /**
     * Retrieves the specified options file name for the final database.
     *
     * @param queryOptionsName
     * @return - Options file as string
     */
    protected String getQueryOptions(String queryOptionsName) {
        String queryOptions;
        try {
            queryOptions = finalDatabaseClient.newServerConfigManager()
                    .newQueryOptionsManager()
                    .readOptionsAs(queryOptionsName, Format.XML, String.class);
        }
        catch (ResourceNotFoundException e) {
            throw new DataHubException(String.format("Could not find search options: %s", queryOptionsName), e);
        }
        return queryOptions;
    }

    private void prepareResponseHeader(HttpServletResponse response, String contentType, String fileName) {
        response.setContentType(contentType);
        response.setHeader(
                "Content-Disposition",
                "attachment;filename=" + fileName);
    }

    private String getFileNameForDownload(JsonNode queryDocument, String fileExtension) {
        String queryInfo = getQueryName(queryDocument);
        if (queryInfo == null) {
            queryInfo = getEntityTypeIdForRowExport(queryDocument);
        }
        String timestamp = DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(ZonedDateTime.now().withNano(0));

        return FILE_PREFIX + queryInfo + SEPARATOR + timestamp + fileExtension;
    }

    private void buildSortOrderOptions(StringBuilder sb, SearchQuery searchQuery) {
        Optional<List<SearchQuery.SortOrder>> sortOrders = searchQuery.getSortOrder();
        sortOrders.ifPresent(so -> {
            sb.append("<options>");
            so.forEach(o -> {
                sb.append("<sort-order");
                if (!METADATA_FIELD_NAME.contains(o.getName())) {
                    sb.append(String.format(" type=\"xs:%s\"", StringEscapeUtils.escapeXml10(o.getDataType())));
                }

                if (o.isAscending()) {
                    sb.append(" direction=\"ascending\">");
                }
                else {
                    sb.append(" direction=\"descending\">");
                }

                if (METADATA_FIELD_NAME.contains(o.getName())) {
                    sb.append(String.format("<field name=\"%s\"/>\n", StringEscapeUtils.escapeXml10(o.getName())));
                }
                else {
                    sb.append(String.format("<element ns=\"\" name=\"%s\"/>\n", StringEscapeUtils.escapeXml10(o.getName())));
                }
                sb.append("</sort-order>");
            });
            sb.append("</options>");
        });
    }
}
