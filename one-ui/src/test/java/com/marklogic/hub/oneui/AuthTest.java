/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.oneui;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.oneui.auth.LoginInfo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {Application.class})
@AutoConfigureMockMvc
class AuthTest {
    private static final String BASE_URL = "/api";
    private static final String LOGIN_URL = BASE_URL + "/login";
    private static final String LOGOUT_URL = BASE_URL + "/logout";

    @Value("${test.mlHost:localhost}")
    public String mlHost;

    @Value("${test.dataHubDeveloperUsername}")
    public String mlDHDeveloper;

    @Value("${test.dataHubDeveloperPassword}")
    public String mlDHDeveloperPwd;

    @Autowired
    MockMvc mockMvc;

    @Test
    void loginWithInvalidCredentials() throws Exception {
        String payload = getLoginPayload("fake", "fake");
        mockMvc
            .perform(post(LOGIN_URL).contentType(MediaType.APPLICATION_JSON).content(payload))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void loginWithValidAdminCredentialsAndLogout() throws Exception {
        String payload = getLoginPayload("admin", "admin");
        final MockHttpSession session[] = new MockHttpSession[1];
        // Login
        mockMvc
            .perform(post(LOGIN_URL).contentType(MediaType.APPLICATION_JSON).content(payload))
            .andDo (
                result -> {
                    session[0] = (MockHttpSession) result.getRequest().getSession();
                    assertTrue(result.getResponse().getContentAsString().contains("\"hasManagePrivileges\":true"));
                })
            .andExpect(status().isOk());

        assertFalse(session[0].isInvalid());

        // Logout
        mockMvc.perform(get(LOGOUT_URL).session(session[0]))
            .andExpect(status().isOk());

        assertTrue(session[0].isInvalid());
    }

    @Test
    void loginWithDevCredentialsAndLogout() throws Exception {
        String payload = getLoginPayload(mlDHDeveloper, mlDHDeveloperPwd);
        final MockHttpSession session[] = new MockHttpSession[1];
        // Login
        mockMvc
            .perform(post(LOGIN_URL).contentType(MediaType.APPLICATION_JSON).content(payload))
            .andDo (
                result -> {
                    session[0] = (MockHttpSession) result.getRequest().getSession();
                    assertTrue(result.getResponse().getContentAsString().contains("\"hasManagePrivileges\":false"));
                })
            .andExpect(status().isOk());

        assertFalse(session[0].isInvalid());

        // Logout
        mockMvc.perform(get(LOGOUT_URL).session(session[0]))
            .andExpect(status().isOk());

        assertTrue(session[0].isInvalid());
    }

    private String getLoginPayload(String username, String password)
        throws JsonProcessingException {
        LoginInfo loginInfo = new LoginInfo();
        loginInfo.username = username;
        loginInfo.password = password;
        loginInfo.mlHost = mlHost;
        return new ObjectMapper().writeValueAsString(loginInfo);
    }
}
