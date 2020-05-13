package com.marklogic.hub.central;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.central.auth.LoginInfo;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcPrint;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Base class for any tests that want to use Spring's MockMvc test helper. Will automatically login as a
 * data-hub-developer unless beforeEachMvcTest is overridden.
 * <p>
 * Similar to AbstractOneUiTest, please be judicious about adding helper methods to this class. Any methods added
 * should be applicable to a wide swath of tests, not just a handful.
 */
/*
 * There is a bug in MockMvc that causes ConcurrentModificationException in the testRowExport() test.
 * This happens when it tries to read the response headers for async requests in
 * order to print the response.
 * Thus, we are switching off the printing of requests/responses on MockMvc test failure.
 * */
@AutoConfigureMockMvc(print = MockMvcPrint.NONE)
public abstract class AbstractMvcTest extends AbstractHubCentralTest {

    @Autowired
    protected MockMvc mockMvc;

    protected MockHttpSession mockHttpSession;

    @BeforeEach
    protected void beforeEachMvcTest() {
        loginAsDataHubDeveloper();
    }

    protected ResultActions loginAsDataHubDeveloper() {
        return loginAsUser(TestConstants.DEVELOPER_USERNAME);
    }

    protected ResultActions loginAsTestUser() {
        return loginAsUser(TestConstants.TEST_USER_USERNAME);
    }

    protected ResultActions loginAsTestUserWithRoles(String... roles) {
        setTestUserRoles(roles);
        return loginAsTestUser();
    }

    protected ResultActions loginAsUser(String username) {
        try {
            return postJson("/api/login", buildLoginPayload(username))
                .andExpect(status().isOk())
                .andDo(result -> {
                    mockHttpSession = (MockHttpSession) result.getRequest().getSession();
                });
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    protected String buildLoginPayload(String username) {
        LoginInfo loginInfo = new LoginInfo();
        loginInfo.username = username;
        loginInfo.password = "password";
        try {
            return objectMapper.writeValueAsString(loginInfo);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    protected ResultActions postJson(String url, Object json) throws Exception {
        return postJson(url, objectMapper.valueToTree(json).toString());
    }

    protected ResultActions postJson(String url, String json) throws Exception {
        MockHttpServletRequestBuilder builder = post(url).contentType(MediaType.APPLICATION_JSON).content(json);
        if (mockHttpSession != null) {
            builder.session(mockHttpSession);
        }
        return mockMvc.perform(builder);
    }

    protected ResultActions putJson(String url, Object json) throws Exception {
        return putJson(url, objectMapper.valueToTree(json).toString());
    }

    protected ResultActions putJson(String url, String json) throws Exception {
        MockHttpServletRequestBuilder builder = put(url).contentType(MediaType.APPLICATION_JSON).content(json);
        if (mockHttpSession != null) {
            builder.session(mockHttpSession);
        }
        return mockMvc.perform(builder);
    }

    protected ResultActions getJson(String url) throws Exception {
        return getJson(url, new LinkedMultiValueMap<>());
    }

    protected ResultActions getJson(String url, MultiValueMap<String, String> params) throws Exception {
        MockHttpServletRequestBuilder builder = get(url).params(params);
        if (mockHttpSession != null) {
            builder.session(mockHttpSession);
        }
        return mockMvc.perform(builder);
    }

    protected ResultActions postWithParams(String url, MultiValueMap<String, String> params) throws Exception {
        MockHttpServletRequestBuilder builder = post(url).contentType(MediaType.APPLICATION_JSON).params(params);
        if (mockHttpSession != null) {
            builder.session(mockHttpSession);
        }
        return mockMvc.perform(builder);
    }

    protected ResultActions delete(String url) throws Exception {
        return delete(url, new LinkedMultiValueMap<>());
    }

    protected ResultActions delete(String url, MultiValueMap<String, String> params) throws Exception {
        MockHttpServletRequestBuilder builder = MockMvcRequestBuilders.delete(url).params(params);
        if (mockHttpSession != null) {
            builder.session(mockHttpSession);
        }
        return mockMvc.perform(builder);
    }

    protected JsonNode parseJsonResponse(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

}
