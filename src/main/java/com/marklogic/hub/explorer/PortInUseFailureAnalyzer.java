/**
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer;

import org.springframework.boot.diagnostics.AbstractFailureAnalyzer;
import org.springframework.boot.diagnostics.FailureAnalysis;
import org.springframework.boot.web.embedded.tomcat.ConnectorStartFailedException;

public class PortInUseFailureAnalyzer extends
    AbstractFailureAnalyzer<ConnectorStartFailedException> {

  @Override
  protected FailureAnalysis analyze(Throwable rootFailure,
      ConnectorStartFailedException cause) {
    return new FailureAnalysis(
        "Explorer server failed to start because port " + cause.getPort()
            + " is already being used.",
        "Try running with a different port:\n "
            + "java -jar web.war --server.port=8080\t\t(replace 8080 with your desired port)",
        cause);
  }
}
