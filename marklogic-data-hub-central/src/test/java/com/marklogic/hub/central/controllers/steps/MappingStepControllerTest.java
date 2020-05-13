package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
        installReferenceModelProject();
        verifyCommonStepEndpoints(PATH, objectMapper.valueToTree(newDefaultMappingStep("myMapper")), "entity-services-mapping", "mapping");
    }

    @Test
    void getMappingStepsByEntity() throws Exception {
        installReferenceModelProject();

        postJson(PATH + "/firstStep", newDefaultMappingStep("firstStep")).andExpect(status().isOk());
        postJson(PATH + "/secondStep", newDefaultMappingStep("secondStep")).andExpect(status().isOk());

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

    private void verifyOrderMappings(JsonNode node) {
        assertEquals("Order", node.get("entityType").asText());
        assertEquals("http://marklogic.com/example/Order-0.0.1/Order", node.get("entityTypeId").asText());
        assertEquals(0, node.get("artifacts").size());
    }

    private void verifyCustomerMappings(JsonNode node) {
        assertEquals("Customer", node.get("entityType").asText());
        assertEquals("http://example.org/Customer-0.0.1/Customer", node.get("entityTypeId").asText());
        assertEquals(3, node.get("artifacts").size(), "Expecting 3 mappings - a 'legacy' one, and the 2 created in this test");
    }
}
