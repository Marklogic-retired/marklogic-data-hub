package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class IngestionStepControllerTest extends AbstractStepControllerTest {

    private final static String PATH = "/api/steps/ingestion";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static class IngestionStep {
        public String name;
        public String description;
        public String sourceFormat;
        public String targetFormat;
        public ArrayNode processors;
        public ArrayNode collections;
    }

    public static IngestionStep newDefaultIngestionStep(String name) {
        IngestionStep step = new IngestionStep();
        step.name = name;
        step.description = "the description";
        step.sourceFormat = "json";
        step.targetFormat = "json";
        step.collections = objectMapper.createArrayNode().add("test");
        step.processors = objectMapper.createArrayNode();
        return step;
    }

    @BeforeEach
    void beforeEach() {
        loginAsTestUserWithRoles("hub-central-load-writer");
    }

    @Test
    void test() throws Exception {
        verifyCommonStepEndpoints(PATH, objectMapper.valueToTree(newDefaultIngestionStep("myIngestionStep")), "default-ingestion", "ingestion");
    }

    @Test
    void getIngestionSteps() throws Exception {
        postJson(PATH + "/firstStep", newDefaultIngestionStep("firstStep"));
        postJson(PATH + "/secondStep", newDefaultIngestionStep("secondStep"));

        getJson(PATH)
            .andExpect(status().isOk())
            .andDo(result -> {
                ArrayNode array = (ArrayNode) parseJsonResponse(result);
                assertEquals(2, array.size());
                assertEquals("firstStep", array.get(0).get("name").asText());
                assertEquals("secondStep", array.get(1).get("name").asText());
            });
    }

    @Test
    void permittedReadUser() throws Exception {
        postJson(PATH + "/firstStep", newDefaultIngestionStep("firstStep"));

        loginAsTestUserWithRoles("hub-central-load-reader");

        getJson(PATH + "/firstStep")
            .andDo(result -> {
                MockHttpServletResponse response = result.getResponse();
                assertEquals(HttpStatus.OK.value(), response.getStatus());
            });
    }

    @Test
    void forbiddenReadUser() throws Exception {
        postJson(PATH + "/firstStep", newDefaultIngestionStep("firstStep"));

        setTestUserRoles("hub-central-user");

        loginAsTestUserWithRoles("hub-central-user");
        getJson(PATH + "/firstStep")
                .andDo(result -> {
                    assertTrue(result.getResolvedException() instanceof AccessDeniedException);
                });
    }

    @Test
    void forbiddenWriteUser() throws Exception {
        loginAsTestUserWithRoles("hub-central-load-reader");
        postJson(PATH + "/firstStep", newDefaultIngestionStep("firstStep"))
                .andDo(result -> {
                    assertTrue(result.getResolvedException() instanceof AccessDeniedException);
                });
    }
}
