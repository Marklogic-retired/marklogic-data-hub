/*
 * Copyright 2012-2021 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.central.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.MarkLogicIOException;
import com.marklogic.hub.central.HttpSessionHubClientProvider;
import com.marklogic.hub.central.HubCentral;
import com.marklogic.hub.dataservices.HubCentralService;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.util.StringUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Custom authentication filter for the marklogic-data-hub-central web application. All authentication logic is handled by this class, with
 * success handled by LoginHandler and failure handled by LoginFailureHandler.
 */
public class AuthenticationFilter extends AbstractAuthenticationProcessingFilter {

    private HubCentral hubCentral;
    private HttpSessionHubClientProvider hubClientProvider;
    private Environment environment;

    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    public AuthenticationFilter(HubCentral hubCentral, HttpSessionHubClientProvider hubClientProvider) {
        super(new AntPathRequestMatcher("/api/login", "POST"));
        this.hubCentral = hubCentral;
        this.hubClientProvider = hubClientProvider;
        setAuthenticationSuccessHandler(new LoginHandler());
        setAuthenticationFailureHandler(new LoginFailureHandler());
    }

    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException, IOException {
        if (!request.getMethod().toUpperCase().equals("POST")) {
            throw new AuthenticationServiceException("Authentication method not supported: " + request.getMethod());
        }

        final LoginInfo loginInfo = new ObjectMapper().readValue(request.getInputStream(), LoginInfo.class);
        if(loginInfo.username.isEmpty() && loginInfo.password.isEmpty() && !request.getHeader("userid").isEmpty()) {
            loginInfo.username = environment.getProperty("mlUsername");
            loginInfo.password = environment.getProperty("mlPassword");
        }
        AuthenticationToken token = authenticateUser(loginInfo.username, loginInfo.password);
        token.setDetails(authenticationDetailsSource.buildDetails(request));
        return token;
    }

    /**
     * Authenticates the user and builds an AuthenticationToken containing the granted authorities.
     * <p>
     * This is the preferred method for determining if an authenticated user is permitted to perform a particular
     * action. The SecurityService endpoint is expected to return an array of strings, each corresponding to a
     * particular action. A Spring Security GrantedAuthority is constructed for each one, using "ROLE_" as a prefix,
     * which is expected by Spring Security's default voting mechanism for whether a user can perform an action or not
     * - see https://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#appendix-faq-role-prefix.
     *
     * @param username
     * @param password
     */
    protected AuthenticationToken authenticateUser(String username, String password) {
        if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password)) {
            throw new BadCredentialsException("Unauthorized");
        }

        username = username.trim();

        hubClientProvider.setHubClientDelegate(hubCentral.newHubConfig(username, password).newHubClient());
        List<GrantedAuthority> authorities = new ArrayList<>();
        JsonNode response;
        try {
            response = HubCentralService.on(hubClientProvider.getHubClient().getStagingClient()).getAuthorities();
        } catch (Exception e) {
            if (e instanceof FailedRequestException) {
                FailedRequestException fre = (FailedRequestException) e;
                if ("Failed Auth".equals(fre.getServerMessage()) || "Failed Auth".equals(fre.getServerStatus())) {
                    throw new BadCredentialsException("Unauthorized");
                }
                //In case user can't read the getAuthorities.sjs module, return an empty 'authorities' object
                if(fre.getServerStatusCode() == 404 || fre.getServerStatusCode() == 403){
                    return new AuthenticationToken(username, password, authorities, false);
                }
            } else if(e instanceof MarkLogicIOException && e.getMessage().contains("Failed to connect to")) {
                DatabaseClient client = hubClientProvider.getHubClient().setNewClient(Integer.parseInt(environment.getProperty("mlContentServerPort")));
                DatabaseClient.ConnectionResult result = client.checkConnection();
                if (result.getStatusCode() == 401) {
                    throw new BadCredentialsException("Unauthorized");
                }
                logger.info("Created client for host: " + client.getHost());
                return new AuthenticationToken(username, password, authorities, false);
            }
            throw e;
        }

        response.get("authorities").iterator().forEachRemaining(node -> {
            String authority = node.asText();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + authority));
        });
        return new AuthenticationToken(username, password, authorities, true);
    }
}
