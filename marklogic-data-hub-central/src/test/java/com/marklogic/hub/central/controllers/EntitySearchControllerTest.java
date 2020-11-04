package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.io.Format;
import com.marklogic.hub.central.AbstractMvcTest;
import com.marklogic.hub.impl.Versions;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class EntitySearchControllerTest extends AbstractMvcTest {

    private final static String BASE_URL = "/api/entitySearch";
    private final static String SAVED_QUERIES_PATH = BASE_URL + "/savedQueries";
    private final static String EXPORT_PATH = BASE_URL + "/export";

    private ObjectNode savedQueryResponse;


    @Test
    void testCRUDOnSavedQuery() throws Exception {
        String json = "{\n" +
            "  \"savedQuery\": {\n" +
            "    \"name\": \"some-query\",\n" +
            "    \"description\": \"some-query-description\",\n" +
            "    \"query\": {\n" +
            "      \"searchText\": \"some-string\",\n" +
            "      \"entityTypeIds\": [\n" +
            "        \"Entity1\"\n" +
            "      ]\n" +
            "    },\n" +
            "    \"propertiesToDisplay\": [\"facet1\", \"EntityTypeProperty1\"]\n" +
            "  }\n" +
            "}";

        // testing save query document
        loginAsTestUserWithRoles("hub-central-saved-query-user");
        postJson(SAVED_QUERIES_PATH, json)
            .andExpect(status().isCreated())
            .andDo(result -> {
                savedQueryResponse = readJsonObject(result.getResponse().getContentAsString());
                assertTrue(savedQueryResponse.get("savedQuery").has("id"), "The ID property should have been set so that the UI " +
                    "can e.g. display a link to the saved query");
            });

        // testing update savedQuery document
        ObjectNode query = (ObjectNode) savedQueryResponse.get("savedQuery");
        query.put("description", "Updated description");

        putJson(SAVED_QUERIES_PATH, savedQueryResponse.toString())
            .andExpect(status().isOk())
            .andDo(result -> {
                ObjectNode response = readJsonObject(result.getResponse().getContentAsString());
                assertEquals("Updated description", response.get("savedQuery").get("description").asText());
            });

        // testing get savedQuery document
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("id", savedQueryResponse.get("savedQuery").get("id").asText());

        getJson(SAVED_QUERIES_PATH + "/query", params)
            .andExpect(status().isOk())
            .andDo(result -> {
                ObjectNode response = readJsonObject(result.getResponse().getContentAsString());
                assertEquals(savedQueryResponse.get("savedQuery").get("id").asText(), response.get("savedQuery").get("id").asText());
            });

        // testing get all savedQuery documents
        getJson(SAVED_QUERIES_PATH, new LinkedMultiValueMap<>())
            .andExpect(status().isOk())
            .andDo(result -> {
                ArrayNode response = readJsonArray(result.getResponse().getContentAsString());
                assertTrue(response.size() > 0, "There should be at least one saved query document");
            });

        // testing delete savedQuery document
        delete(SAVED_QUERIES_PATH + "/query", params)
            .andExpect(status().isNoContent());

        getJson(SAVED_QUERIES_PATH + "/query", params)
            .andExpect(status().isOk())
            .andDo(result -> {
                ObjectNode response = readJsonObject(result.getResponse().getContentAsString());
                assertTrue(response.isEmpty());
            });

        // Try saving queries without the required role "hub-central-saved-query-user"
        loginAsTestUserWithRoles("hub-central-user");
        verifyRequestIsForbidden(buildJsonPost(SAVED_QUERIES_PATH, json));
        verifyRequestIsForbidden(buildJsonPut(SAVED_QUERIES_PATH, savedQueryResponse.toString()));
        verifyRequestIsForbidden(MockMvcRequestBuilders.delete(SAVED_QUERIES_PATH + "/query").param("id", "some-id"));
    }

    @Test
    void testGetDocumentByURI() throws Exception {
        ReferenceModelProject project = installOnlyReferenceModelEntities(true);
        Customer customer1 = new Customer();
        customer1.setCustomerId(1);
        customer1.setName("Jane");
        customer1.setCustomerNumber(123456789);
        customer1.setCustomerSince("2012-05-16");

        project.createCustomerInstance(customer1);
        project.createCustomerInstance(customer1, Format.XML, "doesnt-matter");

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("docUri", "/Customer1.xml");
        getJson(BASE_URL, params).andExpect(status().isOk());
        params = new LinkedMultiValueMap<>();
        params.add("docUri", "/Customer1.json");
        getJson(BASE_URL, params).andExpect(status().isOk());
    }

    @Test
    void testRowExportFromFinalDatabase() throws Exception {
        validateRowExport("final");
    }

    @Test
    void testRowExportFromStagingDatabase() throws Exception {
        validateRowExport("staging");
    }

    @Test
    void testRowExportWithPathRangeQuery() throws Exception {
        assumeTrue(new Versions(getHubConfig()).getMarkLogicVersion().supportsRangeIndexConstraints());
        ReferenceModelProject project = installOnlyReferenceModelEntities(true);
        deployEntityIndexes();

        Customer customer1 = new Customer();
        customer1.setCustomerId(1);
        customer1.setName("Jane");
        customer1.setCustomerNumber(123456789);
        customer1.setCustomerSince("2012-05-16");
        project.createCustomerInstance(customer1);

        Customer customer2 = new Customer();
        customer2.setCustomerId(2);
        customer2.setName("John");
        customer2.setCustomerNumber(987654321);
        customer2.setCustomerSince("2013-06-16");
        project.createCustomerInstance(customer2);

        String json = "{\n" +
                "    \"savedQuery\": {\n" +
                "        \"id\": \"\",\n" +
                "        \"name\": \"some-query\",\n" +
                "        \"description\": \"some-query-description\",\n" +
                "        \"query\": {\n" +
                "            \"searchText\": \"Customer.customerId:2\",\n" +
                "            \"entityTypeIds\": [\n" +
                "                \"Customer\"\n" +
                "            ],\n" +
                "            \"selectedFacets\": {\n" +
                "                \"Collection\": {\n" +
                "                    \"dataType\": \"xs:string\",\n" +
                "                    \"stringValues\": [\n" +
                "                        \"Customer\"\n" +
                "                    ]\n" +
                "                }\n" +
                "            }\n" +
                "        },\n" +
                "        \"propertiesToDisplay\": [\n" +
                "            \"customerId\",\n" +
                "            \"name\",\n" +
                "            \"customerNumber\",\n" +
                "            \"shipping\",\n" +
                "            \"orders\"\n" +
                "        ],\n" +
                "        \"sortOrder\": [\n" +
                "          { \"propertyName\":  \"customerId\",\n" +
                "            \"sortDirection\": \"ascending\"\n" +
                "          }\n" +
                "        ]\n" +
                "    }\n" +
                "}";

        // Even though "propertiesToDisplay" has 5 columns we only export 3 since we dont export object and array type properties for now.
        int totalColumns = 3;
        int limit = 99;
        int expectedCount = 1;
        Object[] customer2Info = {customer2.getCustomerId(), customer2.getName(), customer2.getCustomerNumber()};

        // Log in with role "hub-central-entity-exporter"
        loginAsTestUserWithRoles("hub-central-entity-exporter");

        // Export using query document
        postWithParams(EXPORT_PATH, getRequestParams(limit, json, "final"))
                .andExpect(request().asyncStarted())
                .andDo(MvcResult::getAsyncResult)
                .andExpect(status().isOk())
                .andDo(result -> {
                    String response = result.getResponse().getContentAsString();
                    Set<Integer> actualRowSet = calculateHash(response);
                    assertRowsAndColumns(expectedCount, totalColumns, response);
                    assertTrue(actualRowSet.contains(getHashCode(customer2Info)));
                });
    }

    private void assertRowsAndColumns(int expectedRowCount, int totalColumns, String response) {
        int headerRow = 1;
        int totalRows = expectedRowCount + headerRow;

        assertEquals(totalRows, response.chars().filter(i -> i == '\n').count() + 1);
        assertEquals(totalColumns, response.substring(0, response.indexOf("\n")).chars().filter(i -> i == ',').count() + 1);
    }


    private Set<Integer> calculateHash(String csvData) throws IOException {
        Set<Integer> rowSet = new HashSet<>();

        try (BufferedReader reader = new BufferedReader(new StringReader(csvData))) {
            String line = reader.readLine();
            while (line != null) {
                line = line.replaceAll(",", "");
                rowSet.add(line.hashCode());
                line = reader.readLine();
            }
        }

        return rowSet;
    }

    private int getHashCode(Object... objects) {
        StringBuilder row = new StringBuilder();

        for (Object object : objects) {
            row.append(object);
        }

        return row.toString().hashCode();
    }

    private MultiValueMap<String, String> getRequestParams(int limit, String json, String databaseType) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("fileType", "csv");
        params.add("limit", String.valueOf(limit));
        params.add("queryDocument", json);
        params.add("database", databaseType);
        return params;
    }

    private void validateRowExport(String databaseType) throws Exception {
        ReferenceModelProject project = installOnlyReferenceModelEntities(true);

        Customer customer1 = new Customer();
        customer1.setCustomerId(1);
        customer1.setName("Jane");
        customer1.setCustomerNumber(123456789);
        customer1.setCustomerSince("2012-05-16");
        project.createCustomerInstance(customer1, databaseType);

        Customer customer2 = new Customer();
        customer2.setCustomerId(2);
        customer2.setName("John");
        customer2.setCustomerNumber(987654321);
        customer2.setCustomerSince("2013-06-16");
        project.createCustomerInstance(customer2, databaseType);

        String json = "{\n" +
                "    \"savedQuery\": {\n" +
                "        \"id\": \"\",\n" +
                "        \"name\": \"some-query\",\n" +
                "        \"description\": \"some-query-description\",\n" +
                "        \"query\": {\n" +
                "            \"searchText\": \"\",\n" +
                "            \"entityTypeIds\": [\n" +
                "                \"Customer\"\n" +
                "            ],\n" +
                "            \"selectedFacets\": {\n" +
                "                \"Collection\": {\n" +
                "                    \"dataType\": \"xs:string\",\n" +
                "                    \"stringValues\": [\n" +
                "                        \"Customer\"\n" +
                "                    ]\n" +
                "                }\n" +
                "            }\n" +
                "        },\n" +
                "        \"propertiesToDisplay\": [\n" +
                "            \"customerId\",\n" +
                "            \"name\",\n" +
                "            \"customerNumber\",\n" +
                "            \"shipping\",\n" +
                "            \"orders\"\n" +
                "        ],\n" +
                "        \"sortOrder\": [\n" +
                "          { \"propertyName\":  \"customerId\",\n" +
                "            \"sortDirection\": \"descending\"\n" +
                "          }\n" +
                "        ]\n" +
                "    }\n" +
                "}";

        // Even though "propertiesToDisplay" has 5 columns we only export 3 since we dont export object and array type properties for now.
        int totalColumns = 3;
        int limit = 2;
        Object[] customer1Info = {customer1.getCustomerId(), customer1.getName(), customer1.getCustomerNumber()};
        Object[] customer2Info = {customer2.getCustomerId(), customer2.getName(), customer2.getCustomerNumber()};


        // Try exporting without the required role "hub-central-entity-exporter"
        loginAsTestUserWithRoles("hub-central-user");
        postWithParams(EXPORT_PATH, getRequestParams(limit, json, databaseType))
                .andExpect(status().isForbidden());
        getJson(EXPORT_PATH + "/query/non-existent-query-id", getRequestParams(limit, null, databaseType))
                .andExpect(status().isForbidden());


        // Log in with role "hub-central-entity-exporter"
        loginAsTestUserWithRoles("hub-central-entity-exporter");

        // Export using query document
        postWithParams(EXPORT_PATH, getRequestParams(limit, json, databaseType))
                .andExpect(request().asyncStarted())
                .andDo(MvcResult::getAsyncResult)
                .andExpect(status().isOk())
                .andDo(result -> {
                    String response = result.getResponse().getContentAsString();
                    Set<Integer> actualRowSet = calculateHash(response);
                    assertRowsAndColumns(limit, totalColumns, response);
                    assertTrue(actualRowSet.contains(getHashCode(customer1Info)));
                    assertTrue(actualRowSet.contains(getHashCode(customer2Info)));
                });


        // Log in with exporter and saved-query roles
        loginAsTestUserWithRoles("hub-central-entity-exporter", "hub-central-saved-query-user");

        // Save the query document
        postJson(SAVED_QUERIES_PATH, json)
                .andExpect(status().isCreated())
                .andDo(result -> savedQueryResponse = readJsonObject(result.getResponse().getContentAsString()));

        // Export using queryId
        getJson(EXPORT_PATH + "/query/" + savedQueryResponse.get("savedQuery").get("id").textValue(), getRequestParams(limit, null, databaseType))
                .andExpect(request().asyncStarted())
                .andDo(MvcResult::getAsyncResult)
                .andExpect(status().isOk())
                .andDo(result -> {
                    String response = result.getResponse().getContentAsString();
                    Set<Integer> actualRowSet = calculateHash(response);
                    assertRowsAndColumns(limit, totalColumns, response);
                    assertTrue(actualRowSet.contains(getHashCode(customer1Info)));
                    assertTrue(actualRowSet.contains(getHashCode(customer2Info)));
                });


        // test limit
        int newLimit = 1;
        postWithParams(EXPORT_PATH, getRequestParams(newLimit, json, databaseType))
                .andExpect(request().asyncStarted())
                .andDo(MvcResult::getAsyncResult)
                .andExpect(status().isOk())
                .andDo(result -> {
                    String response = result.getResponse().getContentAsString();
                    Set<Integer> actualRowSet = calculateHash(response);
                    assertRowsAndColumns(newLimit, totalColumns, response);
                    assertTrue(actualRowSet.contains(getHashCode(customer2Info)), "Sort order should guarantee that customer 2 is returned as the one result. Result: " + response);
                });
    }
}
