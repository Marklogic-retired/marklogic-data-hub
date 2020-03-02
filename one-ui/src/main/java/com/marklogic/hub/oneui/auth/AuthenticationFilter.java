/*
 * Copyright 2012-2020 MarkLogic Corporation
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
package com.marklogic.hub.oneui.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.dataservices.RolesService;
import com.marklogic.hub.dataservices.SecurityService;
import com.marklogic.hub.oneui.exceptions.BadRequestException;
import com.marklogic.hub.oneui.exceptions.ForbiddenException;
import com.marklogic.hub.oneui.models.EnvironmentInfo;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.services.EnvironmentService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

/**
 * Custom authentication filter for the one-ui web application. All authentication logic is handled by this class, with
 * success handled by LoginHandler and failure handled by LoginFailureHandler.
 */
public class AuthenticationFilter extends AbstractAuthenticationProcessingFilter {

    private EnvironmentService environmentService;
    private HubConfigSession hubConfig;

    public AuthenticationFilter(EnvironmentService environmentService, HubConfigSession hubConfig) {
        super(new AntPathRequestMatcher("/api/login", "POST"));
        this.environmentService = environmentService;
        this.hubConfig = hubConfig;
        setAuthenticationSuccessHandler(new LoginHandler());
        setAuthenticationFailureHandler(new LoginFailureHandler());
    }

    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException, IOException {
        if (!request.getMethod().toUpperCase().equals("POST")) {
            throw new AuthenticationServiceException("Authentication method not supported: " + request.getMethod());
        }

        final EnvironmentInfo originalEnvironmentInfo = environmentService.getEnvironment();

        final LoginInfo loginInfo = new ObjectMapper().readValue(request.getInputStream(), LoginInfo.class);

        final boolean datahubIsInstalled = StringUtils.isEmpty(loginInfo.mlHost);
        if (!datahubIsInstalled) {
            environmentService.setEnvironment(new EnvironmentInfo(loginInfo.mlHost, loginInfo.mlAuthMethod,
                loginInfo.mlPort, loginInfo.mlManageAuthMethod, loginInfo.mlManagePort, loginInfo.dhStagingAuthMethod, loginInfo.dhStagingPort, loginInfo.dhFinalAuthMethod, loginInfo.dhFinalPort));
        }

        try {
            AuthenticationToken token = authenticateUser(loginInfo.username, loginInfo.password);
            token.setDetails(authenticationDetailsSource.buildDetails(request));
            return token;
        } catch (Exception e) {
            environmentService.setEnvironment(originalEnvironmentInfo);
            throw e;
        }
    }

    /**
     * @param username
     * @param password
     */
    protected AuthenticationToken authenticateUser(String username, String password) {
        if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password)) {
            throw new BadCredentialsException("Unauthorized");
        }

        username = username.trim();

        EnvironmentInfo environmentInfo = environmentService.getEnvironment();
        hubConfig.setCredentials(environmentInfo, username, password);

        final boolean hasManagePrivileges = canAccessManageServer(environmentInfo.mlHost);

        final DatabaseClient stagingClient = hubConfig.newStagingClient(null);

        boolean dataHubInstalled = false;
        List<GrantedAuthority> authorities = new ArrayList<>();
        ArrayNode roles = null;

        try {
            dataHubInstalled = stagingClient.checkConnection().isConnected();
            if (dataHubInstalled) {
                roles = (ArrayNode) RolesService.on(stagingClient).getRoles();
                authorities = getAuthoritiesForAuthenticatedUser(stagingClient);
            }
        } catch (Exception ignored) {
            // TODO Ignoring this because it means the DH isn't installed and needs to be?
        }

        if (!(hasManagePrivileges || dataHubInstalled)) {
            throw new ForbiddenException("User doesn't have the required roles to install or run the Data Hub");
        }

        return new AuthenticationToken(username, password, hasManagePrivileges, dataHubInstalled,
            hubConfig.getHubProject().getProjectName(), roles, authorities);
    }

    /**
     * This is the preferred method for determining if an authenticated user is permitted to perform a particular
     * action. The SecurityService endpoint is expected to return an array of strings, each corresponding to a
     * particular action. A Spring Security GrantedAuthority is constructed for each one, using "ROLE_" as a prefix,
     * which is expected by Spring Security's default voting mechanism for whether a user can perform an action or not
     * - see https://docs.spring.io/spring-security/site/docs/current/reference/htmlsingle/#appendix-faq-role-prefix.
     *
     * @param stagingClient
     * @return
     */
    protected List<GrantedAuthority> getAuthoritiesForAuthenticatedUser(DatabaseClient stagingClient) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        JsonNode response = SecurityService.on(stagingClient).getAuthorities();
        if (response != null && response.has("authorities")) {
            response.get("authorities").iterator().forEachRemaining(node -> {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + node.asText()));
            });
        }
        return authorities;
    }

    protected boolean canAccessManageServer(String host) {
        RestTemplate restTemplate = hubConfig.getManageClient().getRestTemplate();
        URI uri = hubConfig.getManageConfig().buildUri("/v1/ping");
        try {
            restTemplate.getForObject(uri, String.class);
            return true;
        } catch (ResourceAccessException ex) {
            throw new BadRequestException("Cannot connect to MarkLogic at " + host + ". Are you sure MarkLogic is running?", ex);
        } catch (HttpClientErrorException ex) {
            if (HttpStatus.UNAUTHORIZED.equals(ex.getStatusCode())) {
                throw new BadCredentialsException("Unauthorized");
            } else if (!(HttpStatus.NOT_FOUND.equals(ex.getStatusCode()) || HttpStatus.FORBIDDEN.equals(ex.getStatusCode()))) {
                // throw error if not NOT_FOUND or FORBIDDEN, as those errors mean proper credentials, but no access to manage API
                throw ex;
            }
        }
        return false;
    }
}
