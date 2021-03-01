package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;

import com.marklogic.hub.dataservices.StepService;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class CustomStepControllerTest extends AbstractStepControllerTest {

    private final static String PATH = "/api/steps/custom";
    
    /* used to create custom steps */
    private final static String DEFAULT_JSON = "{"
    		+ " \"name\": \"myCustomStep\" , "
    		+ " \"description\": \"\" , "
    		+ " \"selectedSource\": \"\" , "
    		+ " \"sourceQuery\": \"cts.collectionQuery('default')\" , "
    		+ " \"targetEntityType\": \"http://example.org/Customer-0.0.1/Customer\" , "
    		+ " \"stepDefinitionName\": \"custom\" , "
    		+ " \"batchSize\": \"50\" , "
    		+ " \"provenanceGranularityLevel\": \"coarse\" "
    		+ "}";
    private final static ObjectMapper MAPPER = new ObjectMapper();

    public static class CustomStep {
        public String name;
        public String description;
        public String selectedSource;
        public String sourceQuery;
        public String targetEntityType;
        public String stepDefinitionName;
    }

    public static CustomStep newDefaultCustomStep(String name) {
        CustomStep step = new CustomStep();
        step.name = name;
        step.description = "optional";
        step.selectedSource = "collection";
        step.sourceQuery = "cts.collectionQuery('test')";
        step.targetEntityType = "http://example.org/Customer-0.0.1/Customer";
        step.stepDefinitionName = "custom";
        return step;
    }

    @Test
    void userCanUpdateStep() throws Exception {
        installOnlyReferenceModelEntities();
        loginAsTestUserWithRoles("hub-central-custom-writer");

        JsonNode new_node = MAPPER.readTree(DEFAULT_JSON);
        StepService.on(getHubClient().getStagingClient()).saveStep("custom", new_node, false, true);
        
        /* update fields for testing */
        putJson(PATH + "/myCustomStep", newDefaultCustomStep("myCustomStep")).andExpect(status().isOk());
        
        getJson(PATH).andExpect(status().isOk())
        .andDo(result -> {
            ArrayNode array = (ArrayNode) parseJsonResponse(result).get("stepsWithEntity");
            assertEquals(2, array.size(), "should have an entry for Customer and an entry for Order");
            
            /* get entity artifacts */
            JsonNode orderArtifacts = array.get(1).get("artifacts");
            assertEquals(0, orderArtifacts.size(), "should have 0 Order artifacts");
            
            JsonNode customerArtifacts = array.get(0).get("artifacts");
            assertEquals(1, customerArtifacts.size(), "should have 1 Customer artifact");
            JsonNode stepData = customerArtifacts.get(0);
            
            /* custom step name and entity type should not have been changed */
            assertTrue(stepData.get("name").asText().equals("myCustomStep"));
            assertTrue(stepData.get("targetEntityType").asText().equals("http://example.org/Customer-0.0.1/Customer"));
            
            /* other fields should have been updated */
            assertTrue(stepData.get("description").asText().equals("optional"));
            assertTrue(stepData.get("selectedSource").asText().equals("collection"));
            assertTrue(stepData.get("sourceQuery").asText().equals("cts.collectionQuery('test')"));
            
            /* fields not present in update should not have been touched */
            assertTrue(stepData.get("batchSize").asText().equals("50"));
            assertTrue(stepData.get("provenanceGranularityLevel").asText().equals("coarse"));
            assertTrue(stepData.get("sourceDatabase").asText().equals("data-hub-STAGING"));
            assertTrue(stepData.get("targetDatabase").asText().equals("data-hub-FINAL"));
        });
    }

    @Test
    void userCannotReadStep() throws Exception {
        loginAsTestUserWithRoles("hub-central-user");
        mockMvc.perform(get(PATH).session(mockHttpSession))
            .andDo(result -> {
                assertTrue(result.getResolvedException() instanceof AccessDeniedException);
            });
    }

    @Test
    void userCannotWriteStep() throws Exception {
        loginAsTestUserWithRoles("hub-central-custom-writer");
    	
        JsonNode new_node = MAPPER.readTree(DEFAULT_JSON);
        StepService.on(getHubClient().getStagingClient()).saveStep("custom", new_node, false, true);
        
        loginAsTestUserWithRoles("hub-central-custom-reader");
        putJson(PATH + "/myCustomStep", newDefaultCustomStep("myCustomStep"))
            .andDo(result -> {
                assertTrue(result.getResolvedException() instanceof AccessDeniedException);
            });
    }
}
