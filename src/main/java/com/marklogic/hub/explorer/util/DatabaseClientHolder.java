/** Copyright 2019 MarkLogic Corporation. All rights reserved. */
package com.marklogic.hub.explorer.util;

import javax.annotation.PreDestroy;

import com.marklogic.client.DatabaseClient;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;

/**
 * Used as a holder for databaseClient objects. Being session scoped allows to hold separate
 * databaseClient objects for each session. Cleans up by releasing the connection when the session
 * is destroyed.
 */
@Component
@Scope(proxyMode = ScopedProxyMode.TARGET_CLASS, value = "session")
public class DatabaseClientHolder {

  private DatabaseClient databaseClient;

  public DatabaseClient getDatabaseClient() {
    return databaseClient;
  }

  public void setDatabaseClient(DatabaseClient databaseClient) {
    this.databaseClient = databaseClient;
  }

  @PreDestroy
  public void cleanUp() {
    if (databaseClient != null) {
      databaseClient.release();
    }
  }
}
