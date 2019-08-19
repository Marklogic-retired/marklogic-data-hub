/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.explorer.auth;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.FailedRequestException;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

import javax.net.ssl.SSLContext;
import java.security.NoSuchAlgorithmException;

/**
 * Implements Spring Security's AuthenticationManager interface so that it can authenticate users by making a simple
 * request to MarkLogic and checking for a 401. Also implements AuthenticationProvider so that it can be used with
 * Spring Security's ProviderManager.
 */
@Component
public class MarkLogicAuthenticationManager implements AuthenticationProvider, AuthenticationManager {

    public MarkLogicAuthenticationManager() {
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

        if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password) || StringUtils.isEmpty(hostname)) {
            throw new BadCredentialsException("Invalid credentials");
        }

        DatabaseClientFactory.SecurityContext securityContext = new DatabaseClientFactory.DigestAuthContext(username, password);
        try {
            SSLContext sslContext = SSLContext.getDefault();
        }
        catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
//        securityContext.withSSLContext(sslContext, new X509TrustManager() {
//            @Override
//            public void checkClientTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
//
//            }
//
//            @Override
//            public void checkServerTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
//
//            }
//
//            @Override
//            public X509Certificate[] getAcceptedIssuers() {
//                return new X509Certificate[0];
//            }
//        });

        DatabaseClient databaseClient = DatabaseClientFactory.newClient(hostname, 8011, securityContext, DatabaseClient.ConnectionType.GATEWAY);
        try {
            databaseClient.newDocumentManager().exists("user");
        }
        catch (FailedRequestException ex) {
            if (ex.getMessage().contains("Unauthorized")) {
                throw new BadCredentialsException("Invalid credentials");
            }
            else {
                throw ex;
            }
        }

        return new ConnectionAuthenticationToken(token.getPrincipal(), token.getCredentials(),
            token.getHostname(), token.getAuthorities());
    }
}

