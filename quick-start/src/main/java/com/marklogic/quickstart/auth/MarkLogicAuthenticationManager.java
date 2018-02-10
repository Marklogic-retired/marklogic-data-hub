/*
 * Copyright 2012-2018 MarkLogic Corporation
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
package com.marklogic.quickstart.auth;

import com.marklogic.spring.http.RestClient;
import com.marklogic.spring.http.RestConfig;
import com.marklogic.spring.http.SimpleRestConfig;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.Credentials;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.net.URI;

/**
 * Implements Spring Security's AuthenticationManager interface so that it can authenticate users by making a simple
 * request to MarkLogic and checking for a 401. Also implements AuthenticationProvider so that it can be used with
 * Spring Security's ProviderManager.
 */
public class MarkLogicAuthenticationManager implements AuthenticationProvider, AuthenticationManager {

    private SimpleRestConfig restConfig;

    private String pathToAuthenticateAgainst = "/v1/ping";

    /**
     * A RestConfig instance is needed so a request can be made to MarkLogic to see if the user can successfully
     * authenticate.
     *
     * @param restConfig
     */
    public MarkLogicAuthenticationManager(RestConfig restConfig) {
        this.restConfig = (SimpleRestConfig)restConfig;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return ConnectionAuthenticationToken.class.isAssignableFrom(authentication);
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (!(authentication instanceof ConnectionAuthenticationToken)) {
            throw new IllegalArgumentException(
                    getClass().getName() + " only supports " + ConnectionAuthenticationToken.class.getName());
        }

        ConnectionAuthenticationToken token = (ConnectionAuthenticationToken) authentication;
        String username = token.getPrincipal().toString();
        String password = token.getCredentials().toString();
        String hostname = token.getHostname().toString();
        int projectId = token.getProjectId();
        String environment = token.getEnvironment();

        if (username == "" || password == "" || hostname == "") {
          throw new BadCredentialsException("Invalid credentials");
        }
        /**
         * For now, building a new RestTemplate each time. This should in general be okay, because we're typically not
         * authenticating users over and over.
         */
        restConfig.setHost(hostname);
        restConfig.setRestPort(token.getEnvironmentConfig().getMlSettings().getAppConfig().getAppServicesPort());
        RestClient client = new RestClient(restConfig, new SimpleCredentialsProvider(username, password));
        URI uri = client.buildUri(pathToAuthenticateAgainst, null);
        try {
            client.getRestOperations().getForEntity(uri, String.class);
        }
        catch(ResourceAccessException ex) {
            throw new RuntimeException("Cannot connect to MarkLogic at " + hostname + ". Are you sure MarkLogic is running?");
        }
        catch(HttpClientErrorException ex) {
            if (HttpStatus.NOT_FOUND.equals(ex.getStatusCode())) {
                // Authenticated, but the path wasn't found - that's okay, we just needed to verify authentication
            } else if (HttpStatus.UNAUTHORIZED.equals(ex.getStatusCode())) {
                throw new BadCredentialsException("Invalid credentials");
            } else {
                throw ex;
            }
        }

        ConnectionAuthenticationToken authenticationToken =new ConnectionAuthenticationToken(token.getPrincipal(), token.getCredentials(),
                token.getHostname(), projectId, environment, token.getAuthorities());
        authenticationToken.setEnvironmentConfig(token.getEnvironmentConfig());
        return authenticationToken;
    }

    public void setPathToAuthenticateAgainst(String pathToAuthenticateAgainst) {
        this.pathToAuthenticateAgainst = pathToAuthenticateAgainst;
    }
}

/**
 * Simple implementation that is good for one-time requests.
 */
class SimpleCredentialsProvider implements CredentialsProvider {

    private String username;
    private String password;

    public SimpleCredentialsProvider(String username, String password) {
        this.username = username;
        this.password = password;
    }

    @Override
    public void setCredentials(AuthScope authscope, Credentials credentials) {
    }

    @Override
    public Credentials getCredentials(AuthScope authscope) {
        return new UsernamePasswordCredentials(username, password);
    }

    @Override
    public void clear() {
    }

}
