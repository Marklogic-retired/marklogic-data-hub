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
