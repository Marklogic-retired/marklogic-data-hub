package com.marklogic.hub.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class DataHubMonitorTest extends AbstractSecurityTest {

    @Override
    protected String getRoleName() {
        return "data-hub-monitor";
    }

    @Test
    public void task14ViewAuditLog() {
        verifySystemLogsCanBeAccessed();
    }

    @Test
    public void task15MonitorDatabase() {
        assertTrue(roleBeingTested.getRole().contains("manage-user"),
            "The manage-user role grants access to the monitoring GUI on port 8002, which also provides visibility of deadlocks " +
                "(as do the system logs)");
    }

    @Test
    public void task16MonitorBackups() {
        assertTrue(roleBeingTested.getRole().contains("manage-user"),
            "The manage-user role (and the 'manage' role) grants access to 8002:/manage/v2, which provides read-only " +
                "access to database and forest status, which can be used for checking backup status per the instructions at " +
                "https://help.marklogic.com/Knowledgebase/Article/View/377/0/creating-a-web-service-for-monitoring-marklogic-backups");
    }

    @Test
    public void task32ReadJobDocuments() {
        assertTrue(roleBeingTested.getRole().contains("data-hub-job-reader"),
            "The data-hub-job-reader role grants access to Job and Batch documents in the jobs database");
    }

    @Test
    public void task33MonitorAppServerPerformance() {
        assertTrue(roleBeingTested.getRole().contains("manage-user"),
            "The manage-user role grants access to the monitoring GUI on port 8002, which is how app server performance is best monitored");
    }
}
