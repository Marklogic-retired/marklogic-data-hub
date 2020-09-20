/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.central.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.central.AbstractMvcTest;
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

    // Eventually admin won't be able to login
    @Test
    void loginWithValidAdminAndLogout() throws Exception {
        String payload = buildLoginPayload(testConstants.ADMIN_USERNAME);
        mockMvc
                .perform(post(LOGIN_URL).contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isForbidden());
    }

    @Test
    void loginWithSecurityAdmin() throws Exception {
        String payload = buildLoginPayload(testConstants.SECURITY_ADMIN);
        mockMvc
            .perform(post(LOGIN_URL).contentType(MediaType.APPLICATION_JSON).content(payload))
            .andExpect(status().isForbidden());
    }

    @Test
    void loginWithDataHubManagerAndLogout() throws Exception {
        loginAsUser(testConstants.ENVIRONMENT_MANAGER_USERNAME).andDo(
            result -> {
                String strResponse = result.getResponse().getContentAsString();
                JsonNode jsonResponse = objectMapper.readTree(strResponse);
                assertTrue(jsonResponse.get("authorities").isArray());
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
                assertTrue(jsonResponse.get("authorities").isArray());
                assertTrue(jsonResponse.get("authorities").toString().contains("loginToHubCentral"));
            })
            .andExpect(status().isOk());

        assertFalse(mockHttpSession.isInvalid());

        mockMvc.perform(get(LOGOUT_URL).session(mockHttpSession))
            .andExpect(status().isOk());

        assertTrue(mockHttpSession.isInvalid());
    }
}
