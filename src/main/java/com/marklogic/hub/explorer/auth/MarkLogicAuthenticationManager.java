/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.auth;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.DatabaseClientConfig;
import com.marklogic.client.ext.DefaultConfiguredDatabaseClientFactory;
import com.marklogic.client.ext.SecurityContextType;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;
import com.marklogic.hub.explorer.util.ExplorerConfig;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
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

  private static final Logger logger = LoggerFactory.getLogger(MarkLogicAuthenticationManager.class);

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

    DatabaseClientConfig clientConfig = getClientConfig(username, password);
    DatabaseClient databaseClient =
        new DefaultConfiguredDatabaseClientFactory().newDatabaseClient(clientConfig);

    // Attempt connection
    DatabaseClient.ConnectionResult connectionResult;
    try {
      connectionResult = databaseClient.checkConnection();
    } catch (Exception e) {
      throw new InternalAuthenticationServiceException(e.getMessage());
    }

    if (connectionResult != null && !connectionResult.isConnected()) {
      if (connectionResult.getStatusCode() != null && connectionResult.getStatusCode() == 401) {
        throw new BadCredentialsException(connectionResult.getErrorMessage());
      } else {
        throw new InternalAuthenticationServiceException(connectionResult.getErrorMessage());
      }
    }

    // Now that we're authorized, store the databaseClient for future use in a session scoped bean.
    databaseClientHolder.setDatabaseClient(databaseClient);

    /*
     * Creating and storing a DatabaseClient object w/o explicitly specifying the database name as
     * data services only works with the default database associated with the App Server.
     */
    DatabaseClientConfig dataServiceClientConfig = getClientConfig(username, password);
    dataServiceClientConfig.setDatabase(null);
    DatabaseClient dataServiceClient =
        new DefaultConfiguredDatabaseClientFactory().newDatabaseClient(dataServiceClientConfig);
    databaseClientHolder.setDataServiceClient(dataServiceClient);

    return new ConnectionAuthenticationToken(token.getPrincipal(), token.getCredentials(),
        token.getAuthorities());
  }

  private DatabaseClientConfig getClientConfig(String username, String password) {
    DatabaseClientConfig clientConfig = new DatabaseClientConfig(explorerConfig.getHostname(),
        explorerConfig.getFinalPort(), username, password);
    clientConfig.setDatabase(explorerConfig.getFinalDbName());
    clientConfig.setSecurityContextType(SecurityContextType.valueOf(
        explorerConfig.getFinalAuthMethod().toUpperCase()));
    clientConfig.setSslHostnameVerifier(explorerConfig.getFinalSslHostnameVerifier());
    clientConfig.setSslContext(explorerConfig.getFinalSslContext());
    clientConfig.setCertFile(explorerConfig.getFinalCertFile());
    clientConfig.setCertPassword(explorerConfig.getFinalCertPassword());
    clientConfig.setExternalName(explorerConfig.getFinalExternalName());
    clientConfig.setTrustManager(explorerConfig.getFinalTrustManager());
    if (explorerConfig.getHostLoadBalancer()) {
      clientConfig.setConnectionType(DatabaseClient.ConnectionType.GATEWAY);
    }
    return clientConfig;
  }
}

