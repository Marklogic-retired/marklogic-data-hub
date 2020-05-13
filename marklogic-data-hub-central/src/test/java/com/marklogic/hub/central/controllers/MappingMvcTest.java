package com.marklogic.hub.central.controllers;

import com.marklogic.hub.central.AbstractMvcTest;
import com.marklogic.hub.central.controllers.steps.MappingStepControllerTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;

import javax.ws.rs.core.MediaType;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

public class MappingMvcTest  extends AbstractMvcTest {
    private final static String PATH = "/api/steps/mapping";

    @Test
    void permittedReadUser() throws Exception {
        installReferenceModelProject();

        setTestUserRoles("hub-central-mapping-reader");

        loginAsTestUser();

        mockMvc.perform(get(PATH).session(mockHttpSession))
                .andDo(result -> {
                    MockHttpServletResponse response = result.getResponse();
                    assertEquals(MediaType.APPLICATION_JSON, response.getContentType());
                    assertEquals(HttpStatus.OK.value(), response.getStatus());
                });
    }

    @Test
    void forbiddenReadUser() throws Exception {
        setTestUserRoles("hub-central-user");
        loginAsTestUser();
        mockMvc.perform(get(PATH).session(mockHttpSession))
                .andDo(result -> {
                    assertTrue(result.getResolvedException() instanceof AccessDeniedException);
                });
    }

    @Test
    void permittedWriteUser() throws Exception {
        installReferenceModelProject();

        setTestUserRoles("hub-central-mapping-writer");

        loginAsTestUser();

        mockMvc.perform(post(PATH + "/{artifactName}", "TestCustomerMapping")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJsonString(MappingStepControllerTest.newDefaultMappingStep("TestCustomerMapping")))
                .session(mockHttpSession))
                .andDo(result -> {
                    MockHttpServletResponse response = result.getResponse();
                    logger.info(response.toString());
                    assertEquals(HttpStatus.OK.value(), response.getStatus());
                });
    }

    @Test
    void forbiddenWriteUser() throws Exception {
        setTestUserRoles("hub-central-mapping-reader");
        loginAsTestUser();
        mockMvc.perform(post(PATH + "/{artifactName}", "TestCustomerMapping")
                .contentType(MediaType.APPLICATION_JSON)
                .content(toJsonString(MappingStepControllerTest.newDefaultMappingStep("TestCustomerMapping")))
                .session(mockHttpSession))
                .andDo(result -> {
                    assertTrue(result.getResolvedException() instanceof AccessDeniedException);
                });
    }

    private String toJsonString(Object obj) {
        return objectMapper.valueToTree(obj).toString();
    }
}