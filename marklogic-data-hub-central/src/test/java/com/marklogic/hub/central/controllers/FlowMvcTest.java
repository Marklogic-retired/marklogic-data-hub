package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.central.AbstractMvcTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;

import javax.ws.rs.core.MediaType;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;



public class FlowMvcTest extends AbstractMvcTest {

    @Autowired
    FlowController flowController;

    private final static String PATH = "/api/flows";

    @Test
    void runIngestionStep() throws Exception {
        installReferenceModelProject();
        if(isVersionCompatibleWith520Roles()) {
            loginAsTestUserWithRoles("hub-central-step-runner");
        }
        else {
            loginAsTestUserWithRoles("hub-central-step-runner", "flow-operator-role");
        }

        MockMultipartFile file1 = new MockMultipartFile("files","file1.json", MediaType.APPLICATION_JSON, "{\"name\": \"Joe\"}".getBytes(StandardCharsets.UTF_8));
        MockMultipartFile file2 = new MockMultipartFile("files","file2.json", MediaType.APPLICATION_JSON, "{\"name\": \"John\"}".getBytes(StandardCharsets.UTF_8));
        flowController.setFlowRunnerConsumer((flowRunner -> {
            flowRunner.awaitCompletion();
        }));
        mockMvc.perform(multipart(PATH + "/{flowName}/steps/{stepNumber}", "ingestToFinal", "1")
            .file(file1)
            .file(file2)
            .session(mockHttpSession))
            .andExpect(status().isOk());

        JsonNode rawDoc = getFinalDoc("/customers/file1.json");
        assertEquals("Joe", rawDoc.get("envelope").get("instance").get("name").asText(),
            "Verifying that 2 docs were ingested into the final database");

        rawDoc = getFinalDoc("/customers/file2.json");
        assertEquals("John", rawDoc.get("envelope").get("instance").get("name").asText(),
            "Verifying that 2 docs were ingested into the final database");
    }

}
