package com.marklogic.hub.central;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.marklogic.hub.central.auth.LoginInfo;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.util.MultiValueMap;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Base class for any tests that want to use Spring's MockMvc test helper. Will automatically login as a
 * data-hub-developer unless beforeEachMvcTest is overridden.
 * <p>
 * Similar to AbstractOneUiTest, please be judicious about adding helper methods to this class. Any methods added
 * should be applicable to a wide swath of tests, not just a handful.
 */
@AutoConfigureMockMvc
public abstract class AbstractMvcTest extends AbstractHubCentralTest {

    @Autowired
    protected MockMvc mockMvc;

    protected MockHttpSession mockHttpSession;

    @BeforeEach
    protected void beforeEachMvcTest() {
        loginAsDataHubDeveloper();
    }

    protected ResultActions loginAsDataHubDeveloper() {
        return loginAsUser(testConstants.DEVELOPER_USERNAME);
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

    protected ResultActions postJson(String url, String json) throws Exception {
        MockHttpServletRequestBuilder builder = post(url).contentType(MediaType.APPLICATION_JSON).content(json);
        if (mockHttpSession != null) {
            builder.session(mockHttpSession);
        }
        return mockMvc.perform(builder);
    }

    protected ResultActions putJson(String url, String json) throws Exception {
        MockHttpServletRequestBuilder builder = put(url).contentType(MediaType.APPLICATION_JSON).content(json);
        if (mockHttpSession != null) {
            builder.session(mockHttpSession);
        }
        return mockMvc.perform(builder);
    }

    protected ResultActions getJson(String url, MultiValueMap<String, String> params) throws Exception {
        MockHttpServletRequestBuilder builder = get(url).params(params);
        if (mockHttpSession != null) {
            builder.session(mockHttpSession);
        }
        return mockMvc.perform(builder);
    }

    protected ResultActions deleteJson(String url, MultiValueMap<String, String> params) throws Exception {
        MockHttpServletRequestBuilder builder = delete(url).params(params);
        if (mockHttpSession != null) {
            builder.session(mockHttpSession);
        }
        return mockMvc.perform(builder);
    }
}
