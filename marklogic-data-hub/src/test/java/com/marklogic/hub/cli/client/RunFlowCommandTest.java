package com.marklogic.hub.cli.client;

import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.Test;

import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class RunFlowCommandTest {

    @Test
    void buildHubConfig() {
        RunFlowCommand command = new RunFlowCommand();
        command.setHost("somewhere");
        command.setUsername("someone");
        command.setPassword("something");
        command.setParams(new HashMap<>());
        command.getParams().put("mlStagingPort", "8410");
        command.getParams().put("mlStagingDbName", "my-STAGING");

        HubConfigImpl config = command.buildHubConfig();
        assertEquals("somewhere", config.getHost());
        assertEquals("someone", config.getMlUsername());
        assertEquals("something", config.getMlPassword());
        assertEquals(8410, config.getPort(DatabaseKind.STAGING));
        assertEquals("my-STAGING", config.getDbName(DatabaseKind.STAGING));
        assertEquals("data-hub-FINAL", config.getDbName(DatabaseKind.FINAL), "Smoke-checking that the default properties " +
            "were set as well");
    }

    @Test
    void ssl() {
        RunFlowCommand command = new RunFlowCommand();
        command.setSsl(true);

        HubConfigImpl config = command.buildHubConfig();
        assertTrue(config.getSimpleSsl(DatabaseKind.STAGING));
        assertTrue(config.getSimpleSsl(DatabaseKind.FINAL));
        assertTrue(config.getSimpleSsl(DatabaseKind.JOB));
    }

    @Test
    void digestAuth() {
        HubConfigImpl config = new RunFlowCommand().buildHubConfig();
        assertEquals("digest", config.getAuthMethod(DatabaseKind.STAGING));
        assertEquals("digest", config.getAuthMethod(DatabaseKind.FINAL));
        assertEquals("digest", config.getAuthMethod(DatabaseKind.JOB));
    }

    @Test
    void basicAuth() {
        RunFlowCommand command = new RunFlowCommand();
        command.setAuth("basic");
        
        HubConfigImpl config = command.buildHubConfig();
        assertEquals("basic", config.getAuthMethod(DatabaseKind.STAGING));
        assertEquals("basic", config.getAuthMethod(DatabaseKind.FINAL));
        assertEquals("basic", config.getAuthMethod(DatabaseKind.JOB));
    }
}
