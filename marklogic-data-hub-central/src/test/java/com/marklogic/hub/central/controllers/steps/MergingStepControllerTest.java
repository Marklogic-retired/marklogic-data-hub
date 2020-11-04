package com.marklogic.hub.central.controllers.steps;

import java.util.Arrays;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.junit.Assert;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.Assert.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class MergingStepControllerTest extends AbstractStepControllerTest {

    private final static String PATH = "/api/steps/merging";

    public static class MergingStep {
        public String name;
        public String description;
        public String selectedSource;
        public String sourceQuery;
        public String targetEntityType;
    }

    public static MergingStep newDefaultMergingStep(String name) {
        MergingStep step = new MergingStep();
        step.name = name;
        step.description = "optional";
        step.selectedSource = "collection";
        step.sourceQuery = "cts.collectionQuery('test')";
        step.targetEntityType = "http://example.org/Customer-0.0.1/Customer";
        return step;
    }

    @Test
    void test() throws Exception {
        loginAsTestUserWithRoles("hub-central-match-merge-writer");
        verifyCommonStepEndpoints(PATH, objectMapper.valueToTree(newDefaultMergingStep("myMergingStep")), "default-merging", "merging");
    }

    @Test
    void getMergingSteps() throws Exception {
        installOnlyReferenceModelEntities();
        loginAsTestUserWithRoles("hub-central-match-merge-writer");

        postJson(PATH + "/firstStep", newDefaultMergingStep("firstStep"));
        postJson(PATH + "/secondStep", newDefaultMergingStep("secondStep"));

        loginAsTestUserWithRoles("hub-central-match-merge-reader");

        getJson(PATH)
            .andExpect(status().isOk())
            .andDo(result -> {
                ArrayNode array = (ArrayNode) parseJsonResponse(result);
                assertEquals(2, array.size());
                int entityIndex = 0;
                if (array.get(entityIndex).get("entityType").asText().equals("Order")) {
                    entityIndex = 1;
                }
                JsonNode artifactsArray = array.get(entityIndex).get("artifacts");
                List<String> actual = Arrays.asList(artifactsArray.get(0).get("name").asText(), artifactsArray.get(1).get("name").asText());
                assertTrue(actual.contains("firstStep"));
                assertTrue(actual.contains("secondStep"));
            });
    }

    @Test
    void permittedReadUser() throws Exception {
        loginAsTestUserWithRoles("hub-central-match-merge-writer");

        postJson(PATH + "/firstStep", newDefaultMergingStep("firstStep"));

        loginAsTestUserWithRoles("hub-central-match-merge-reader");

        getJson(PATH + "/firstStep")
            .andDo(result -> {
                MockHttpServletResponse response = result.getResponse();
                assertEquals(HttpStatus.OK.value(), response.getStatus());
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
        loginAsTestUserWithRoles("hub-central-match-merge-reader");
        postJson(PATH + "/firstStep", newDefaultMergingStep("firstStep"))
            .andDo(result -> {
                assertTrue(result.getResolvedException() instanceof AccessDeniedException);
            });
    }

    @Test
    void getDefaultCollections() throws Exception {
        loginAsTestUserWithRoles("hub-central-match-merge-reader");
        getJson(PATH + "/defaultCollections/Customer")
            .andExpect(status().isOk())
            .andDo(result -> {
                JsonNode response = parseJsonResponse(result);
                assertNotNull(response.get("onMerge"));
                Assert.assertEquals(response.get("onMerge").size(), 2);
                Assert.assertTrue(response.get("onMerge").get(0).asText().startsWith("sm-Customer-"));
                assertNotNull(response.get("onNoMatch"));
                assertNotNull(response.get("onArchive"));
                assertNotNull(response.get("onNotification"));
                assertNotNull(response.get("onMerge"));
            });
    }
}
