package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;
import com.marklogic.hub.dataservices.StepService;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.*;
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
            + " \"stepDefinitionType\": \"custom\" , "
            + " \"stepId\": \"myCustomStep-custom\" , "
    		+ " \"batchSize\": \"50\" , "
    		+ " \"provenanceGranularityLevel\": \"coarse\" "
    		+ "}";
    
    @Test
    void permittedWriteUser() throws Exception {
    	installOnlyReferenceModelEntities();
        loginAsTestUserWithRoles("hub-central-custom-writer");
        
        /* create new custom step (not supported by CustomStepController) */
        JsonNode newCustomStepNode = (new ObjectMapper()).readTree("{"
        		+ " \"name\": \"myCustomStep\" , "
        		+ " \"description\": \"\" , "
        		+ " \"selectedSource\": \"\" , "
        		+ " \"sourceQuery\": \"cts.collectionQuery('default')\" , "
        		+ " \"targetEntityType\": \"http://example.org/Customer-0.0.1/Customer\" , "
        		+ " \"stepDefinitionName\": \"custom\" , "
                + " \"stepDefinitionType\": \"custom\" , "
                + " \"stepId\": \"myCustomStep-custom\" , "
        		+ " \"batchSize\": \"50\" , "
        		+ " \"provenanceGranularityLevel\": \"coarse\" , "
        		+ " \"prop\": \"value\" , " // additional settings
        		+ " \"prop2\": \"value2\" "
        		+ "}");
        StepService.on(getHubClient().getStagingClient()).saveStep("custom", newCustomStepNode, false, true);
        
        getJson(PATH + "/myCustomStep").andExpect(status().isOk())
        .andDo(result -> updateCustomStep(parseJsonResponse(result)));
        
        getJson(PATH + "/myCustomStep").andExpect(status().isOk())
        .andDo(result -> {
            JsonNode stepData = parseJsonResponse(result);

            assertTrue(stepData.get("name").asText().equals("myCustomStep"));
            assertTrue(stepData.get("sourceQuery").asText().equals("no_query"));
            
            assertNotNull(stepData.get("additionalSettings"));
            assertTrue(stepData.get("additionalSettings").get("prop").asText().equals("foo"));
            assertNull(stepData.get("additionalSettings").get("prop2"));
        });
    }

    private void updateCustomStep(JsonNode customStepNode) throws Exception {
        ObjectNode updatedCustomStepNode = (ObjectNode) customStepNode;
        ObjectNode additionalSettings = (ObjectNode) customStepNode.get("additionalSettings");

        additionalSettings.put("prop", "foo");
        additionalSettings.remove("prop2");

        updatedCustomStepNode.set("additionalSettings", additionalSettings);
        updatedCustomStepNode.put("sourceQuery", "no_query");
        putJson(PATH + "/myCustomStep", updatedCustomStepNode).andExpect(status().isOk());
    }

    @Test
    void permittedReadUserAdditionalSettings() throws Exception {
    	/* only tests /api/step/custom/${stepName} endpoint */
    	
    	installOnlyReferenceModelEntities();
        loginAsTestUserWithRoles("hub-central-custom-writer");

        /* create new custom step (not supported by CustomStepController) */
        JsonNode newCustomStepNode = (new ObjectMapper()).readTree("{"
        		+ " \"name\": \"myCustomStep\" , "
        		+ " \"description\": \"\" , "
        		+ " \"selectedSource\": \"\" , "
        		+ " \"sourceQuery\": \"cts.collectionQuery('default')\" , "
        		+ " \"targetEntityType\": \"http://example.org/Customer-0.0.1/Customer\" , "
        		+ " \"stepDefinitionName\": \"custom\" , "
                + " \"stepDefinitionType\": \"custom\" , "
                + " \"stepId\": \"myCustomStep-custom\" , "
        		+ " \"batchSize\": \"50\" , "
        		+ " \"provenanceGranularityLevel\": \"coarse\" , "
        		+ " \"prop\": \"value\" " // additional settings
        		+ "}");
        StepService.on(getHubClient().getStagingClient()).saveStep("custom", newCustomStepNode, false, true);
        
        getJson(PATH + "/myCustomStep").andExpect(status().isOk())
        .andDo(result -> {
            JsonNode stepData = parseJsonResponse(result);

            assertTrue(stepData.get("name").asText().equals("myCustomStep"));
            assertTrue(stepData.get("targetEntityType").asText().equals("http://example.org/Customer-0.0.1/Customer"));
            
            assertNotNull(stepData.get("additionalSettings"));
            assertTrue(stepData.get("additionalSettings").get("prop").asText().equals("value"));
        });
    }
    
    @Test
    void permittedReadUser() throws Exception {
    	/* only tests /api/steps/custom endpoint */
    	
    	installOnlyReferenceModelEntities();
        loginAsTestUserWithRoles("hub-central-custom-writer");
    	
        JsonNode node_1 = (new ObjectMapper()).readTree("{"
        		+ " \"name\": \"custom-step-1\" , "
        		+ " \"selectedSource\": \"\" , "
        		+ " \"sourceQuery\": \"cts.collectionQuery('default')\" , "
        		+ " \"targetEntityType\": \"http://example.org/Customer-0.0.1/Customer\" , "
        		+ " \"stepDefinitionName\": \"custom\" , "
                + " \"stepDefinitionType\": \"custom\" , "
                + " \"stepId\": \"custom-step-1-custom\" "
        		+ "}");
        StepService.on(getHubClient().getStagingClient()).saveStep("custom", node_1, false, true);
        
        JsonNode node_2 = (new ObjectMapper()).readTree("{"
        		+ " \"name\": \"custom-step-2\" , "
        		+ " \"selectedSource\": \"\" , "
        		+ " \"sourceQuery\": \"cts.collectionQuery('default')\" , "
        		+ " \"targetEntityType\": \"http://example.org/Customer-0.0.1/Customer\" , "
        		+ " \"stepDefinitionName\": \"custom\" , "
                + " \"stepDefinitionType\": \"custom\" , "
                + " \"stepId\": \"custom-step-2-custom\" "
        		+ "}");
        StepService.on(getHubClient().getStagingClient()).saveStep("custom", node_2, false, true);
        
        loginAsTestUserWithRoles("hub-central-custom-reader");
        
        getJson(PATH).andExpect(status().isOk())
        .andDo(result -> {
            ArrayNode array = (ArrayNode) parseJsonResponse(result).get("stepsWithEntity");
            assertEquals(2, array.size(), "should have an entry for Customer and an entry for Order");
            
            /* get entity artifacts */
            JsonNode orderArtifacts = array.get(1).get("artifacts");
            assertEquals(0, orderArtifacts.size(), "should have 0 Order artifacts");
            
            JsonNode customerArtifacts = array.get(0).get("artifacts");
            assertEquals(2, customerArtifacts.size(), "should have 2 Customer artifacts");
            
            if (customerArtifacts.get(0).get("name").asText().equals("custom-step-1")) {
            	assertTrue(customerArtifacts.get(1).get("name").asText().equals("custom-step-2"));
            }
            else if (customerArtifacts.get(1).get("name").asText().equals("custom-step-1")) {
            	assertTrue(customerArtifacts.get(0).get("name").asText().equals("custom-step-2"));
            }
            else {
            	fail("Custom step custom-step-1 is not found in response");
            }
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
        loginAsTestUserWithRoles("hub-central-custom-writer");
    	
        JsonNode newCustomStepNode = (new ObjectMapper()).readTree(DEFAULT_JSON);
        StepService.on(getHubClient().getStagingClient()).saveStep("custom", newCustomStepNode, false, true);
        
        loginAsTestUserWithRoles("hub-central-custom-reader");
        putJson(PATH + "/myCustomStep", newCustomStepNode)
            .andDo(result -> {
                assertTrue(result.getResolvedException() instanceof AccessDeniedException);
            });
    }
}
