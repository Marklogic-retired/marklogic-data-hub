package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.client.FailedRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;

import javax.ws.rs.core.MediaType;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class MappingStepControllerTest extends AbstractStepControllerTest {

    private final static String PATH = "/api/steps/mapping";

    public static class MappingStep {
        public String name;
        public String description;
        public String selectedSource;
        public String sourceQuery;
        public String targetEntityType;
    }

    public static MappingStep newDefaultMappingStep(String name) {
        MappingStep step = new MappingStep();
        step.name = name;
        step.description = "optional";
        step.selectedSource = "collection";
        step.sourceQuery = "cts.collectionQuery('test')";
        step.targetEntityType = "http://example.org/Customer-0.0.1/Customer";
        return step;
    }

    @Test
    void test() throws Exception {
        installOnlyReferenceModelEntities();
        loginAsTestUserWithRoles("hub-central-mapping-writer");
        verifyCommonStepEndpoints(PATH, objectMapper.valueToTree(newDefaultMappingStep("myMapper")), "entity-services-mapping", "mapping");
    }

    @Test
    void getMappingStepsByEntity() throws Exception {
        installOnlyReferenceModelEntities();
        loginAsTestUserWithRoles("hub-central-mapping-writer");

        postJson(PATH, newDefaultMappingStep("firstStep")).andExpect(status().isOk());
        postJson(PATH, newDefaultMappingStep("firstStep"))
            .andDo(result -> {
                assertTrue(result.getResolvedException() instanceof FailedRequestException);
                assertTrue(result.getResolvedException().getMessage().contains("A step of type 'mapping' with the name 'firstStep' already exists"));
            });
        postJson(PATH, newDefaultMappingStep("secondStep")).andExpect(status().isOk());

        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                ArrayNode array = (ArrayNode) parseJsonResponse(result);
                assertEquals(2, array.size(), "Should have an entry for Customer and an entry for Order");
                if (array.get(0).get("entityType").asText().equals("Order")) {
                    verifyOrderMappings(array.get(0));
                    verifyCustomerMappings(array.get(1));
                } else {
                    verifyOrderMappings(array.get(1));
                    verifyCustomerMappings(array.get(0));
                }
            });
    }

    @Test
    void permittedReadUser() throws Exception {
        loginAsTestUserWithRoles("hub-central-mapping-reader");

        getJson(PATH)
            .andDo(result -> {
                MockHttpServletResponse response = result.getResponse();
                assertEquals(MediaType.APPLICATION_JSON, response.getContentType());
                assertEquals(HttpStatus.OK.value(), response.getStatus());
            });
        getJson("/api/artifacts/mapping/functions")
            .andDo(result -> {
                MockHttpServletResponse response = result.getResponse();
                assertEquals(MediaType.APPLICATION_JSON, response.getContentType());
                assertEquals(HttpStatus.OK.value(), response.getStatus());
                JsonNode functionsJson = parseJsonResponse(result);
                List<String> functionNames = new ArrayList<>();
                for(int i = 0; i< functionsJson.size(); i++){
                    functionNames.add(functionsJson.get(i).get("functionName").asText());
                }
                assertTrue(functionNames.contains("parseDateTime"), "List of functions should contain parseDateTime");
                assertTrue(functionNames.contains("parseDate"), "List of functions should contain parseDate");
            });
    }

    @Test
    void forbiddenReadUser() throws Exception {
        loginAsTestUserWithRoles("hub-central-user");
        mockMvc.perform(get(PATH).session(mockHttpSession))
            .andDo(result -> {
                assertTrue(result.getResolvedException() instanceof AccessDeniedException);
            });
    }

    @Test
    void forbiddenWriteUser() throws Exception {
        loginAsTestUserWithRoles("hub-central-mapping-reader");
        mockMvc.perform(post(PATH)
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.valueToTree(MappingStepControllerTest.newDefaultMappingStep("TestCustomerMapping")).toString())
            .session(mockHttpSession))
            .andDo(result -> {
                assertTrue(result.getResolvedException() instanceof AccessDeniedException);
            });
    }

    @Test
    void nonExistentDoc() throws Exception {
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/reference-project");
        loginAsTestUserWithRoles("hub-central-mapping-reader");
        final String uri = "/uri/to/non-existent/doc.json";
        mockMvc.perform(get(PATH + "/{stepName}/doc", "testMap")
            .param("docUri", uri)
            .session(mockHttpSession))
            .andDo(result -> {
                Exception e = result.getResolvedException();
                if (e != null) {
                    if (e instanceof FailedRequestException) {
                        FailedRequestException fre = (FailedRequestException) result.getResolvedException();
                        assertEquals("Could not find a document with URI: " + uri, fre.getServerStatus(),
                            "Unexpected server status value.");
                        assertEquals(404, fre.getServerStatusCode(), "Unexpected server status code.");
                    } else {
                        fail("Expected FailedRequestException but received " + e.getClass().getName());
                    }
                } else {
                    fail("Expected an exception but one was not thrown.");
                }
            });
    }

    @Test
    void existentDoc() throws Exception {
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/reference-project");
        loginAsTestUserWithRoles("hub-central-mapping-reader");
        final String uri = "/entities/Customer.entity.json"; // not a data file per se but in reference-project.
        mockMvc.perform(get(PATH + "/{stepName}/doc", "testMap")
            .param("docUri", uri)
            .session(mockHttpSession))
            .andDo(result -> {
                Exception e = result.getResolvedException();
                if (e != null) {
                    fail("The following exception was thrown when no exception was expected: " + e.toString());
                }
            });
    }

    @Test
    void getXmlDocumentForMapping() throws Exception {
        final String uri = "/testDoc1.xml";
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/reference-project");
        writeStagingXmlDoc("/testDoc1.xml", "<test>12</test>", "content");
        loginAsTestUserWithRoles("hub-central-developer");

        final String expectedResponse = "{\"data\":{\"test\":12}," +
            "\"namespaces\":{\"entity-services\":\"http://marklogic.com/entity-services\"}," +
            "\"format\":\"XML\"," +
            "\"sourceProperties\":[{\"name\":\"test\",\"xpath\":\"/test\",\"struct\":false,\"level\":0}]}";

        mockMvc.perform(get(PATH + "/{stepName}/doc", "testMap")
                .param("docUri", uri)
                .session(mockHttpSession))
            .andDo(result -> {
                MockHttpServletResponse response = result.getResponse();
                assertEquals(HttpStatus.OK.value(), response.getStatus());
                assertEquals(200, response.getStatus());
                assertEquals(expectedResponse, response.getContentAsString());
            });
    }

    @Test
    void getMappingStepReferences() throws Exception {
        installOnlyReferenceModelEntities();
        loginAsTestUserWithRoles("hub-central-mapping-writer");

        postJson(PATH, newDefaultMappingStep("firstStep")).andExpect(status().isOk());
        loginAsTestUserWithRoles("hub-central-mapping-reader");

        mockMvc.perform(get(PATH + "/{stepName}/references", "firstStep")
            .session(mockHttpSession))
            .andDo(result -> {
                MockHttpServletResponse response = result.getResponse();
                assertEquals(MediaType.APPLICATION_JSON, response.getContentType());
                assertEquals(HttpStatus.OK.value(), response.getStatus());
                JsonNode referencesJson = parseJsonResponse(result);

                assertEquals(1, referencesJson.size(), "There are no other references other than $URI");
                assertEquals("$URI", referencesJson.get(0).get("name").asText());
                assertEquals("The URI of the source document", referencesJson.get(0).get("description").asText());
            });

        loginAsTestUserWithRoles("hub-central-user");
        mockMvc.perform(get(PATH + "/{stepName}/references", "firstStep").session(mockHttpSession))
            .andDo(result -> assertTrue(result.getResolvedException() instanceof AccessDeniedException));
    }

    private void verifyOrderMappings(JsonNode node) {
        assertEquals("Order", node.get("entityType").asText());
        assertEquals("http://marklogic.com/example/Order-0.0.1/Order", node.get("entityTypeId").asText());
        assertEquals(0, node.get("artifacts").size());
    }

    private void verifyCustomerMappings(JsonNode node) {
        assertEquals("Customer", node.get("entityType").asText());
        assertEquals("http://example.org/Customer-0.0.1/Customer", node.get("entityTypeId").asText());
        assertEquals(2, node.get("artifacts").size(), "Expecting the 2 mappings created by this test");
    }
}
