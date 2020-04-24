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
package com.marklogic.hub.central.managers;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ForbiddenUserException;
import com.marklogic.client.MarkLogicServerException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.io.marker.StructureWriteHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryBuilder.Operator;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.central.exceptions.DataHubException;
import com.marklogic.hub.central.models.DocSearchQueryInfo;
import com.marklogic.hub.central.models.Document;
import com.marklogic.hub.central.models.SearchQuery;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.text.StringEscapeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class EntitySearchManager {

    private static final String COLLECTION_CONSTRAINT_NAME = "Collection";
    private static final String CREATED_ON_CONSTRAINT_NAME = "createdOnRange";
    private static final String JOB_WORD_CONSTRAINT_NAME = "createdByJobWord";
    private static final String JOB_RANGE_CONSTRAINT_NAME = "createdByJob";

    private static final String MASTERING_AUDIT_COLLECTION_NAME = "mdm-auditing";
    private static final String[] IGNORED_SM_COLLECTION_SUFFIX = {"auditing", "notification"};

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter
        .ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSZ");

    private static final String SEARCH_HEAD = "<search xmlns=\"http://marklogic.com/appservices/search\">\n";
    private static final String SEARCH_TAIL = "</search>";
    private static final Set<String> METADATA_FIELD_NAME = new HashSet<>(Arrays.asList("datahubCreatedOn"));

    private static final Logger logger = LoggerFactory.getLogger(EntitySearchManager.class);



    public static String QUERY_OPTIONS = "exp-final-entity-options";
    private DatabaseClient finalDatabaseClient;
    private ModelManager modelManager;

    public EntitySearchManager(HubClient hubClient) {
        this.finalDatabaseClient = hubClient.getFinalClient();
        this.modelManager = new ModelManager(hubClient);
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
            return queryMgr.search(rcQueryDef, resultHandle, searchQuery.getStart());
        }
        catch (MarkLogicServerException e) {
            // If there are no entityModels to search, then we expect an error because no search options will exist
            if(searchQuery.getQuery().getEntityTypeIds().isEmpty() || modelManager.getModels().size() == 0) {
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

        // Filtering search results for docs related to an entity
        if (!CollectionUtils.isEmpty(searchQuery.getQuery().getEntityTypeIds())) {
            // Collections to search
            String[] collections = searchQuery.getQuery().getEntityTypeIds().toArray(new String[0]);
            // Collections that have the mastering audit and notification docs. Excluding docs from
            // these collection in search results
            String[] excludedCollections = getExcludedCollections(
                searchQuery.getQuery().getEntityTypeIds());

            StructuredQueryDefinition finalCollQuery = queryBuilder
                .andNot(queryBuilder.collection(collections),
                    queryBuilder.collection(excludedCollections));

            queries.add(finalCollQuery);
        }
        else { // If entity-model collections are empty, don't return any documents
            StructuredQueryDefinition finalCollQuery = queryBuilder.and(queryBuilder.collection());
            queries.add(finalCollQuery);
        }

        // Filtering by facets
        searchQuery.getQuery().getSelectedFacets().forEach((facetType, data) -> {
            StructuredQueryDefinition facetDef = null;

            if (facetType.equals(COLLECTION_CONSTRAINT_NAME)) {
                facetDef = queryBuilder
                    .collectionConstraint(facetType, data.getStringValues().toArray(new String[0]));
            }
            else if (facetType.equals(JOB_RANGE_CONSTRAINT_NAME)) {
                facetDef = queryBuilder
                    .wordConstraint(JOB_WORD_CONSTRAINT_NAME,
                        data.getStringValues().toArray(new String[0]));
            }
            else if (facetType.equals(CREATED_ON_CONSTRAINT_NAME)) {
                // Converting the date in string format from yyyy-MM-dd format to yyyy-MM-dd HH:mm:ss format
                LocalDate startDate = LocalDate.parse(data.getRangeValues().getLowerBound(), DATE_FORMAT);
                String startDateTime = startDate.atStartOfDay(ZoneId.systemDefault())
                    .format(DATE_TIME_FORMAT);

                // Converting the date in string format from yyyy-MM-dd format to yyyy-MM-dd HH:mm:ss format
                // Adding 1 day to end date to get docs harmonized on the end date as well.
                LocalDate endDate = LocalDate.parse(data.getRangeValues().getUpperBound(), DATE_FORMAT)
                    .plusDays(1);
                String endDateTime = endDate.atStartOfDay(ZoneId.systemDefault()).format(DATE_TIME_FORMAT);

                facetDef = queryBuilder
                    .and(queryBuilder.rangeConstraint(facetType, Operator.GE, startDateTime),
                        queryBuilder.rangeConstraint(facetType, Operator.LT, endDateTime));
            }
            else { // If a property is not a Hub property, then it is an Entity Property
                facetDef = getEntityPropertyConstraints(facetType, data, queryBuilder);
            }

            if (facetDef != null) {
                queries.add(facetDef);
            }
        });

        // And between all the queries
        StructuredQueryDefinition finalQueryDef = queryBuilder
            .and(queries.toArray(new StructuredQueryDefinition[0]));

        return finalQueryDef;
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

    private StructuredQueryDefinition getEntityPropertyConstraints(String facetType, DocSearchQueryInfo.FacetData data,
                                                                   StructuredQueryBuilder queryBuilder) {
        StructuredQueryDefinition facetDef = null;
        switch (data.getDataType()) {
            case "int":
            case "integer":
            case "decimal":
            case "long":
            case "float":
            case "double":
            case "date":
            case "dateTime":
                String lowerBound = data.getRangeValues().getLowerBound();
                String upperBound = data.getRangeValues().getUpperBound();
                if (StringUtils.isNotEmpty(lowerBound) || StringUtils.isNotEmpty(upperBound)) {
                    facetDef = queryBuilder
                        .and(queryBuilder.rangeConstraint(facetType, Operator.GE, lowerBound),
                            queryBuilder.rangeConstraint(facetType, Operator.LE, upperBound));
                }
                break;

            default:
                facetDef = queryBuilder.rangeConstraint(facetType, StructuredQueryBuilder.Operator.EQ,
                    data.getStringValues().toArray(new String[0]));
        }
        return facetDef;
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
                } else {
                    sb.append(" direction=\"descending\">");
                }

                if (METADATA_FIELD_NAME.contains(o.getName())) {
                    sb.append(String.format("<field name=\"%s\"/>\n", StringEscapeUtils.escapeXml10(o.getName())));
                } else {
                    sb.append(String.format("<element ns=\"\" name=\"%s\"/>\n", StringEscapeUtils.escapeXml10(o.getName())));
                }
                sb.append("</sort-order>");
            });
            sb.append("</options>");
        });
    }
}
