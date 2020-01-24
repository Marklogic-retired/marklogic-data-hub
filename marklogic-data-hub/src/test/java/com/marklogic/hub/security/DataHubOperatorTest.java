package com.marklogic.hub.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * This includes most of the privileges inherited by flow-operator-role, as this role is intended to replace that
 * one. It does not yet include the "manage" privilege, as there doesn't appear to be a use case for that yet.
 * <p>
 * XDBC privileges are retained to support mlcp usage when ingesting data.
 * <p>
 * This no longer tests running flows, as FlowRunnerTest and MappingTest will all run as a data-hub-operator if possible.
 */
public class DataHubOperatorTest extends AbstractSecurityTest {

    @Override
    protected String getRoleName() {
        return "data-hub-operator";
    }

    @Test
    public void task32ReadJobDocuments() {
        assertTrue(roleBeingTested.getRole().contains("data-hub-job-reader"),
            "The data-hub-job-reader role grants access to Job and Batch documents in the jobs database");
    }

    @Test
    void readSchemas() {
        assertTrue(roleBeingTested.getRole().contains("tde-view"),
            "The entity models and generated artifacts in the schema databases are known to have a tde-view/read " +
                "permissions on them. Since they may have no other read permissions, the operator requires this so that " +
                "it can read entity models.");
    }
}
