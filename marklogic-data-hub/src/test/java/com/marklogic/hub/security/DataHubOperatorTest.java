package com.marklogic.hub.security;

import com.marklogic.bootstrap.Installer;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * This includes most of the privileges inherited by flow-operator-role, as this role is intended to replace that
 * one. It does not yet include the "manage" privilege, as there doesn't appear to be a use case for that yet.
 * <p>
 * XDBC privileges are retained to support mlcp usage when ingesting data.
 */
public class DataHubOperatorTest extends AbstractSecurityTest {

    @Autowired
    FlowRunnerImpl flowRunner;

    @Override
    protected String getRoleName() {
        return "data-hub-operator";
    }

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().deleteProjectDir();
    }

    @AfterAll
    public static void cleanUp() {
        new Installer().deleteProjectDir();
    }

    @Test
    public void task30RunFlow() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        setupProjectForRunningTestFlow();

        try {
            getHubFlowRunnerConfig(userWithRoleBeingTested.getUserName(), userWithRoleBeingTested.getPassword());

            flowRunner.runFlow("testFlow");
            flowRunner.awaitCompletion();
            verifyCollectionCountsFromRunningTestFlow();
            assertEquals(getDocCount(HubConfig.DEFAULT_JOB_NAME, "Jobs"), 3,
                "For task 32, data-hub-operator should be able to see documents in the Jobs collection via the " +
                    "data-hub-job-reader role, and there should be 3 documents - 2 in Batch, and 1 in Job");
        } finally {
            adminHubConfig.setMlUsername(super.user);
            adminHubConfig.setMlPassword(super.password);
        }
    }

    @Test
    public void task32ReadJobDocuments() {
        assertTrue(roleBeingTested.getRole().contains("data-hub-job-reader"),
            "The data-hub-job-reader role grants access to Job and Batch documents in the jobs database");
    }
}
