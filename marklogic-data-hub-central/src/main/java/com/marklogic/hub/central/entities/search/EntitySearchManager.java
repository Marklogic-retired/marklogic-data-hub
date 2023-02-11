/*
 * Copyright 2012-2021 MarkLogic Corporation
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
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.MarkLogicServerException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.*;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.central.entities.search.impl.CollectionFacetHandler;
import com.marklogic.hub.central.entities.search.impl.CreatedOnFacetHandler;
import com.marklogic.hub.central.entities.search.impl.EntityPropertyFacetHandler;
import com.marklogic.hub.central.entities.search.impl.JobRangeFacetHandler;
import com.marklogic.hub.central.entities.search.impl.StepRangeFacetHandler;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;
import com.marklogic.hub.central.entities.search.models.SearchQuery;
import com.marklogic.hub.central.exceptions.DataHubException;
import com.marklogic.hub.dataservices.EntitySearchService;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.FileCopyUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class EntitySearchManager {

    private static final String CSV_CONTENT_TYPE = "text/csv";
    private static final String CSV_FILE_EXTENSION = ".csv";
    private static final String SEPARATOR = "_";
    private static final String FILE_PREFIX = "DH_Export_";

    private static final Logger logger = LoggerFactory.getLogger(EntitySearchManager.class);

    public String QUERY_OPTIONS;
    private static Map<String, FacetHandler> facetHandlerMap;
    private DatabaseClient searchDatabaseClient;
    private DatabaseClient savedQueryDatabaseClient;

    public EntitySearchManager(HubClient hubClient) {
        this.searchDatabaseClient = hubClient.getFinalClient();
        this.QUERY_OPTIONS = "exp-final-entity-options";
        initializeFacetHandlerMap();
    }

    public EntitySearchManager(HubClient hubClient, String database) {
        if("staging".equalsIgnoreCase(database)) {
            this.searchDatabaseClient = hubClient.getStagingClient();
            this.QUERY_OPTIONS = "exp-staging-entity-options";
        } else {
            this.searchDatabaseClient = hubClient.getFinalClient();
            this.QUERY_OPTIONS = "exp-final-entity-options";
        }
        this.savedQueryDatabaseClient = hubClient.getFinalClient();
        initializeFacetHandlerMap();
    }

    public StringHandle search(SearchQuery searchQuery) {
        return search(searchQuery, false);
    }

    public StringHandle search(SearchQuery searchQuery, boolean forExport) {
        QueryManager queryMgr = searchDatabaseClient.newQueryManager();

        // Setting criteria and searching
        StringHandle resultHandle = new StringHandle();
        resultHandle.setFormat(Format.JSON);
        try {
            //buildQuery includes datetime conversion which could cause DateTimeException or DateTimeParseException
            RawStructuredQueryDefinition queryDefinition = buildQuery(queryMgr, searchQuery);
            queryDefinition.setCriteria(searchQuery.calculateSearchCriteriaWithSortOperator());

            List<String> selectedEntityTypes = searchQuery.getQuery().getSelectedEntityTypes();
            if (!selectedEntityTypes.isEmpty()) {
                ServerTransform searchResultsTransform = new ServerTransform("hubEntitySearchTransform");
                if (selectedEntityTypes.size() == 1) {
                    searchResultsTransform.put("entityName", selectedEntityTypes.get(0));
                }
                searchResultsTransform.put("forExport", Boolean.toString(forExport));
                searchResultsTransform.put("propertiesToDisplay", searchQuery.getPropertiesToDisplay());
                queryDefinition.setResponseTransform(searchResultsTransform);
            } else {
                ServerTransform searchResultsTransform = new ServerTransform("hubAllDataSearchTransform");
                queryDefinition.setResponseTransform(searchResultsTransform);
            }

            return queryMgr.search(queryDefinition, resultHandle, searchQuery.getStart());
        } catch (MarkLogicServerException e) {
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
            throw e;
        }
    }

    public RawStructuredQueryDefinition graphSearchQuery(SearchQuery searchQuery) {

        if (searchQuery.getQuery().isEmpty()) {
            return null;
        }
        QueryManager queryMgr = searchDatabaseClient.newQueryManager();

        // Setting criteria and searching
        StringHandle resultHandle = new StringHandle();
        resultHandle.setFormat(Format.JSON);
        try {
            //buildQuery includes datetime conversion which could cause DateTimeException or DateTimeParseException
            RawStructuredQueryDefinition queryDefinition = buildQuery(queryMgr, searchQuery);
            return queryDefinition;

        } catch (MarkLogicServerException e) {
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
            throw e;
        }
    }

    private RawStructuredQueryDefinition buildQuery(QueryManager queryMgr, SearchQuery searchQuery) {
        queryMgr.setPageLength(searchQuery.getPageLength());
        StructuredQueryBuilder queryBuilder = queryMgr.newStructuredQueryBuilder(QUERY_OPTIONS);
        List<StructuredQueryDefinition> queries = new ArrayList<>();
        searchQuery.getQuery().getSelectedFacets().forEach((facetType, data) -> {
            StructuredQueryDefinition facetDef = facetHandlerMap.getOrDefault(facetType, new EntityPropertyFacetHandler(facetType))
                    .buildQuery(data, queryBuilder);

            if (facetDef != null) {
                queries.add(facetDef);
            }
        });
        String structuredQueryStr = queryBuilder.and(queries.toArray(new StructuredQueryDefinition[0])).serialize();
        DocumentBuilderFactory docbf = DocumentBuilderFactory.newInstance();
        docbf.setNamespaceAware(true);

        //Filter by Related document
        DocSearchQueryInfo.RelatedData relatedData = searchQuery.getQuery().getRelatedDocument();
        if (relatedData != null) {
            DocumentBuilder docBuilder;
            Document document;
            try {
                docBuilder = docbf.newDocumentBuilder();
                document = docBuilder.parse(new InputSource(new StringReader(structuredQueryStr)));
            } catch (IOException|ParserConfigurationException|SAXException e) {
                throw new RuntimeException("XML parsing error!", e);
            }

            Node andQueryNode = document.getElementsByTagNameNS("http://marklogic.com/appservices/search", "and-query").item(0);
            andQueryNode
                    .appendChild(document.createElementNS("http://marklogic.com/appservices/search", "custom-constraint-query"))
                    .appendChild(document.createElementNS("http://marklogic.com/appservices/search", "constraint-name"))
                    .appendChild(document.createTextNode(Constants.RELATED_TO_CONSTRAINT_NAME))
                    .getParentNode().getParentNode()
                    .appendChild(document.createElementNS("http://marklogic.com/appservices/search", "predicate"))
                    .appendChild(document.createTextNode(relatedData.getPredicate()))
                    .getParentNode().getParentNode()
                    .appendChild(document.createElementNS("http://marklogic.com/appservices/search", "docIRI"))
                    .appendChild(document.createTextNode(relatedData.getDocIRI()))
                    .getParentNode().getParentNode()
                    .appendChild(document.createElementNS("http://marklogic.com/appservices/search", "datatype"))
                    .appendChild(document.createTextNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"));



            String output = "";
            try {
                TransformerFactory tf = TransformerFactory.newInstance();
                Transformer transformer = tf.newTransformer();
                transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
                StringWriter writer = new StringWriter();
                transformer.transform(new DOMSource(document), new StreamResult(writer));
                output = writer.getBuffer().toString().replaceAll("\n|\r", "");
            } catch(Exception e) {
                logger.warn("Unable to parse structured query XML", e);
            }

            structuredQueryStr = output;
        }
        // And between all the queries
        return queryMgr.newRawStructuredQueryDefinition(new StringHandle(structuredQueryStr).withFormat(Format.XML), QUERY_OPTIONS);
    }

    private void initializeFacetHandlerMap() {
        facetHandlerMap = new HashMap<>();
        facetHandlerMap.put(Constants.COLLECTION_CONSTRAINT_NAME, new CollectionFacetHandler());
        facetHandlerMap.put(Constants.JOB_RANGE_CONSTRAINT_NAME, new JobRangeFacetHandler());
        facetHandlerMap.put(Constants.RAN_STEP_RANGE_CONSTRAINT_NAME, new StepRangeFacetHandler());
        facetHandlerMap.put(Constants.CREATED_ON_CONSTRAINT_NAME, new CreatedOnFacetHandler());
    }

    public void exportById(String queryId, String fileType, Long limit, OutputStream out, HttpServletResponse response) {
        JsonNode queryDocument = EntitySearchService.on(savedQueryDatabaseClient).getSavedQuery(queryId);
        exportByQuery(queryDocument, fileType, limit, out, response);
    }

    public void exportByQuery(JsonNode queryDocument, String fileType, Long limit, OutputStream out, HttpServletResponse response) {
        if ("CSV".equals(fileType.toUpperCase())) {
            prepareResponseHeader(response, CSV_CONTENT_TYPE, getFileNameForDownload(queryDocument, CSV_FILE_EXTENSION));
            exportRows(queryDocument, limit, out);
        } else {
            throw new DataHubException("Invalid file type: " + fileType);
        }
    }

    public void exportRows(JsonNode queryDocument, Long limit, OutputStream out) {
        QueryManager queryMgr = searchDatabaseClient.newQueryManager();
        SearchQuery searchQuery = transformToSearchQuery(queryDocument);
        Reader export = null;
        if(searchQuery.getQuery().getEntityTypeIds().size() > 1) {
            searchQuery.setPageLength(limit != null && limit > 0 ? limit : Long.MAX_VALUE);
            String exportData = search(searchQuery, true) == null ? "" : search(searchQuery, true).get();
            export = new StringReader(exportData);
        } else {
            RawStructuredQueryDefinition structuredQueryDefinition = buildQuery(queryMgr, searchQuery);

            final String structuredQuery = structuredQueryDefinition.serialize();
            final String searchText = searchQuery.getQuery().calculateSearchCriteria();
            final String queryOptions = getQueryOptions(QUERY_OPTIONS);
            final String entityTypeId = getEntityTypeIdForRowExport(queryDocument);
            final List<String> columns = getColumnNamesForRowExport(queryDocument);
            final List<SearchQuery.SortOrder> sortOrder = searchQuery.getSortOrder().orElse(new ArrayList<>());
            final ArrayNode sortOrderNode = sortOrderToArrayNode(sortOrder);

            // Exporting directly from Data Service to avoid bug https://bugtrack.marklogic.com/55338 related to namespaced path range indexes
            export = EntitySearchService.on(searchDatabaseClient)
                .exportSearchAsCSV(structuredQuery, searchText, queryOptions, entityTypeId, entityTypeId, limit, sortOrderNode, columns.stream());
        }

        try {
            FileCopyUtils.copy(export, new OutputStreamWriter(out, StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public String getQueryOptions(){
        return  getQueryOptions(QUERY_OPTIONS);
    }

    protected SearchQuery transformToSearchQuery(JsonNode queryDocument) {
        SearchQuery searchQuery = Optional.of(queryDocument)
                .map(node -> node.get("savedQuery"))
                .map(node -> node.get("query"))
                .map(node -> {
                    try {
                        return new ObjectMapper().treeToValue(node, DocSearchQueryInfo.class);
                    } catch (JsonProcessingException e) {
                        throw new DataHubException("Invalid query");
                    }
                })
                .map(docSearchQueryInfo -> {
                    final SearchQuery query = new SearchQuery();
                    query.setQuery(docSearchQueryInfo);
                    return query;
                })
                .orElseThrow(() -> new DataHubException("Valid query required"));
        List<SearchQuery.SortOrder> sortOrderList = getSortOrderListForRowExport(queryDocument);
        searchQuery.setSortOrder(sortOrderList);

        return searchQuery;
    }

    protected String getEntityTypeIdForRowExport(JsonNode queryDocument) {
        return Optional.of(queryDocument)
                .map(node -> node.get("savedQuery"))
                .map(node -> node.get("query"))
                .map(node -> node.get("entityTypeIds"))
                .map(node -> node.size() > 1 ? "AllEntities" : node.get(0).textValue())
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

    protected List<SearchQuery.SortOrder> getSortOrderListForRowExport(JsonNode queryDocument) {
        List<SearchQuery.SortOrder> sortOrderList = new ArrayList<>();
        ObjectMapper objectMapper = new ObjectMapper();
        Optional.of(queryDocument)
                .map(node -> node.get("savedQuery"))
                .map(node -> node.get("sortOrder"))
                .ifPresent(node -> node.forEach(colNode -> {
                    try {
                        sortOrderList.add(objectMapper.treeToValue(colNode, SearchQuery.SortOrder.class));
                    }
                    catch (JsonProcessingException e) {
                        throw new DataHubException("Invalid query");
                    }
                }));
        return sortOrderList;
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
            queryOptions = searchDatabaseClient.newServerConfigManager()
                    .newQueryOptionsManager()
                    .readOptionsAs(queryOptionsName, Format.XML, String.class);
        } catch (ResourceNotFoundException e) {
            throw new RuntimeException(String.format("Could not find search options: %s", queryOptionsName), e);
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

    private ArrayNode sortOrderToArrayNode(List<SearchQuery.SortOrder> sortOrderList) {
        ObjectMapper objectMapper = new ObjectMapper();
        ArrayNode arrayNode = objectMapper.createArrayNode();
        for (SearchQuery.SortOrder sortOrder: sortOrderList) {
            ObjectNode objectNode = objectMapper.createObjectNode();
            objectNode.put("propertyName", sortOrder.getPropertyName());
            objectNode.put("sortDirection", sortOrder.getSortDirection());
            arrayNode.add(objectNode);
        }
        return arrayNode;
    }
}
