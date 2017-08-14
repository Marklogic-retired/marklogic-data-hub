package com.marklogic.quickstart;

import org.springframework.boot.context.embedded.tomcat.ConnectorStartFailedException;
import org.springframework.boot.diagnostics.AbstractFailureAnalyzer;
import org.springframework.boot.diagnostics.FailureAnalysis;

public class PortInUseFailureAnalyzer extends AbstractFailureAnalyzer<ConnectorStartFailedException> {
    @Override
    protected FailureAnalysis analyze(Throwable rootFailure,
                                      ConnectorStartFailedException cause) {
        return new FailureAnalysis(
            "QuickStart failed to start because port " + cause.getPort()
                + " is already being used.",
            "Try running with a different port:\n "
                + "java -jar quickstart.war --server.port=8080\t\t(replace 8080 with your desired port)",
            cause);
    }
}
