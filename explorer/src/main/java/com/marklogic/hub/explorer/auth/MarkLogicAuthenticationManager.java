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
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.ext.DatabaseClientConfig;
import com.marklogic.client.ext.DefaultConfiguredDatabaseClientFactory;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;
import com.marklogic.hub.explorer.util.ExplorerConfig;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

/**
 * Implements Spring Security's AuthenticationManager interface so that it can authenticate users by
 * making a simple request to MarkLogic and checking for a 401. Also implements
 * AuthenticationProvider so that it can be used with Spring Security's ProviderManager.
 */
@Component
public class MarkLogicAuthenticationManager implements AuthenticationProvider,
    AuthenticationManager {

  @Autowired
  DatabaseClientHolder databaseClientHolder;

  @Autowired
  ExplorerConfig explorerConfig;

  public MarkLogicAuthenticationManager() {
  }

  @Override
  public boolean supports(Class<?> authentication) {
    return ConnectionAuthenticationToken.class.isAssignableFrom(authentication);
  }

  @Override
  public Authentication authenticate(Authentication authentication)
      throws AuthenticationException {
    if (!(authentication instanceof ConnectionAuthenticationToken)) {
      throw new IllegalArgumentException(
          getClass().getName() + " only supports " + ConnectionAuthenticationToken.class
              .getName());
    }

    ConnectionAuthenticationToken token = (ConnectionAuthenticationToken) authentication;
    String username = token.getPrincipal().toString();
    String password = token.getCredentials().toString();

    if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password)) {
      throw new BadCredentialsException("Invalid credentials");
    }

    DatabaseClientConfig clientConfig = new DatabaseClientConfig(explorerConfig.getHostname(),
        explorerConfig.getFinalPort(), username, password);
    clientConfig.setDatabase(explorerConfig.getFinalDbName());
    clientConfig.setSecurityContextType(
        SecurityContextType.valueOf(explorerConfig.getFinalAuthMethod().toUpperCase()));
    clientConfig.setSslHostnameVerifier(explorerConfig.getFinalSslHostnameVerifier());
    clientConfig.setSslContext(explorerConfig.getFinalSslContext());
    clientConfig.setCertFile(explorerConfig.getFinalCertFile());
    clientConfig.setCertPassword(explorerConfig.getFinalCertPassword());
    clientConfig.setExternalName(explorerConfig.getFinalExternalName());
    clientConfig.setTrustManager(explorerConfig.getFinalTrustManager());
    if (explorerConfig.getHostLoadBalancer()) {
      clientConfig.setConnectionType(DatabaseClient.ConnectionType.GATEWAY);
    }
    DatabaseClient databaseClient =
        new DefaultConfiguredDatabaseClientFactory().newDatabaseClient(clientConfig);

    try {
      databaseClient.newDocumentManager().exists("user");
    } catch (FailedRequestException ex) {
      if (ex.getMessage().contains("Unauthorized")) {
        throw new BadCredentialsException("Invalid credentials");
      } else {
        throw ex;
      }
    }

    // Now that we're authorized, store the databaseClient for future use in a session scoped bean.
    databaseClientHolder.setDatabaseClient(databaseClient);

    return new ConnectionAuthenticationToken(token.getPrincipal(), token.getCredentials(),
        token.getAuthorities());
  }
}

