package com.marklogic.hub.explorer.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.explorer.WebApplication;
import com.marklogic.hub.explorer.auth.ConnectionAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {WebApplication.class})
@AutoConfigureMockMvc
class AuthTest {

    private static String BASE_URL = "/datahub/v2";
    private static String LOGIN_URL = BASE_URL + "/login";
    private static String LOGOUT_URL = BASE_URL + "/logout";
    // TODO: Change the test page url to actual one
    private static String PAGE_URL = BASE_URL + "/test";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void accessAnyWebPageWithoutLogin() throws Exception {
        this.mockMvc.perform(get(PAGE_URL))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void loginWithInvalidCredentials() throws Exception {
        String payload = getLoginPayload("xyz", "bla");

        this.mockMvc.perform(post(LOGIN_URL).contentType(MediaType.APPLICATION_JSON_UTF8).content(payload))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void loginWithValidCredentials() throws Exception {
        // TODO: Get test credentials instead of admin/admin
        String payload = getLoginPayload("admin", "admin");

        this.mockMvc.perform(post(LOGIN_URL).contentType(MediaType.APPLICATION_JSON_UTF8).content(payload))
            .andExpect(status().isOk());
    }

    @Test
    void accessAnyWebPageAfterLogout() throws Exception {
        // TODO: Get test credentials instead of admin/admin
        String payload = getLoginPayload("admin", "admin");
        final ArrayList<MockHttpSession> mockHttpSession = new ArrayList<>();

        // Login
        this.mockMvc.perform(post(LOGIN_URL).contentType(MediaType.APPLICATION_JSON_UTF8).content(payload))
            .andDo(result -> mockHttpSession.add((MockHttpSession) result.getRequest().getSession()))
            .andExpect(status().isOk());

        // Access Page
        this.mockMvc.perform(get(PAGE_URL).session(mockHttpSession.get(0)))
            .andExpect(status().isOk());

        // Logout
        this.mockMvc.perform(get(LOGOUT_URL).session(mockHttpSession.get(0)))
            .andExpect(status().isOk());

        // Access Page again
        this.mockMvc.perform(get(PAGE_URL).session(mockHttpSession.get(0)))
            .andExpect(status().isUnauthorized());
    }

    private String getLoginPayload(String username, String password) throws JsonProcessingException {
        ConnectionAuthenticationFilter.LoginInfo loginInfo = new ConnectionAuthenticationFilter.LoginInfo();
        loginInfo.username = username;
        loginInfo.password = password;
        return new ObjectMapper().writeValueAsString(loginInfo);
    }
}
