package com.marklogic.hub.error;

import java.util.List;

public class LegacyFlowsException extends RuntimeException {

    public LegacyFlowsException(List<String> legacyFlows) {
        super("The following Flows are legacy flows:\n" + String.join("\n", legacyFlows) + "\nPlease update them with ./gradlew hubUpdate");
    }
}
