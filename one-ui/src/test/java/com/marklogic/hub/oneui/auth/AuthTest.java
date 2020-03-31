/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.oneui.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.oneui.AbstractMvcTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthTest extends AbstractMvcTest {

    private static final String LOGIN_URL = "/api/login";
    private static final String LOGOUT_URL = "/api/logout";

    @Override
    protected void beforeEachMvcTest() {
        // Don't do anything, as each method in here will try to login
    }

    @Test
    void loginWithInvalidCredentials() throws Exception {
        String payload = buildLoginPayload("fake");
        mockMvc
            .perform(post(LOGIN_URL).contentType(MediaType.APPLICATION_JSON).content(payload))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void loginWithValidAdminAndLogout() throws Exception {
        loginAsUser(testConfig.adminUsername).andDo(result -> {
            String strResponse = result.getResponse().getContentAsString();
            JsonNode jsonResponse = objectMapper.readTree(strResponse);
            assertTrue(jsonResponse.get("roles").isArray());
            assertTrue(jsonResponse.get("authorities").isArray());
            assertTrue(jsonResponse.get("authorities").toString().contains("canInstallDataHub"));
        });

        assertFalse(mockHttpSession.isInvalid());

        mockMvc.perform(get(LOGOUT_URL).session(mockHttpSession))
            .andExpect(status().isOk());

        assertTrue(mockHttpSession.isInvalid());
    }

    @Test
    void loginWithDataHubManagerAndLogout() throws Exception {
        loginAsUser(testConfig.dataHubEnvironmentManagerUsername).andDo(
            result -> {
                String strResponse = result.getResponse().getContentAsString();
                JsonNode jsonResponse = objectMapper.readTree(strResponse);
                assertTrue(jsonResponse.get("roles").isArray());
                assertTrue(jsonResponse.get("authorities").isArray());
                assertTrue(jsonResponse.get("authorities").toString().contains("canInstallDataHub"));
            })
            .andExpect(status().isOk());

        assertFalse(mockHttpSession.isInvalid());

        mockMvc.perform(get(LOGOUT_URL).session(mockHttpSession))
            .andExpect(status().isOk());

        assertTrue(mockHttpSession.isInvalid());
    }

    @Test
    void loginWithDeveloperUserAndLogout() throws Exception {
        loginAsDataHubDeveloper().andDo(
            result -> {
                String strResponse = result.getResponse().getContentAsString();
                JsonNode jsonResponse = objectMapper.readTree(strResponse);
                assertTrue(jsonResponse.get("roles").isArray());
                assertTrue(jsonResponse.get("authorities").isArray());
                assertFalse(jsonResponse.get("authorities").toString().contains("canInstallDataHub"));
            })
            .andExpect(status().isOk());

        assertFalse(mockHttpSession.isInvalid());

        mockMvc.perform(get(LOGOUT_URL).session(mockHttpSession))
            .andExpect(status().isOk());

        assertTrue(mockHttpSession.isInvalid());
    }
}
