package com.marklogic.hub.cli.client;

import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class RunFlowCommandTest {

    @Test
    public void buildHubConfig() {
        RunFlowCommand command = new RunFlowCommand();
        command.setHost("somewhere");
        command.setUsername("someone");
        command.setPassword("something");
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
}
