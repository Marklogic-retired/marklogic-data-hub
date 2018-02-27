package com.marklogic.hub.error;

import com.marklogic.hub.DatabaseKind;

public class InvalidDBOperationError extends Error {
    public InvalidDBOperationError(DatabaseKind kind, String operation) {
        super("Attempt to " + operation + " on the " + kind + " database");
    }
}
