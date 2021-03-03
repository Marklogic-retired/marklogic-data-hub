package com.marklogic.hub.clientjar;

import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

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
        Stream.of(DatabaseKind.STAGING, DatabaseKind.FINAL, DatabaseKind.JOB).forEach(kind -> {
            assertTrue(config.getSimpleSsl(kind));
            assertNotNull(config.getSslContext(kind));
            assertNotNull(config.getSslHostnameVerifier(kind));
            assertNotNull(config.getTrustManager(kind));
        });
    }

    @Test
    void sslWithDynamicParams() {
        RunFlowCommand command = new RunFlowCommand();
        command.setSsl(true);
        Map<String, String> params = new HashMap<>();
        params.put("mlFinalPort", "8012");
        command.setParams(params);

        HubConfigImpl config = command.buildHubConfig();
        Stream.of(DatabaseKind.STAGING, DatabaseKind.FINAL, DatabaseKind.JOB).forEach(kind -> {
            assertTrue(config.getSimpleSsl(kind));
            assertNotNull(config.getSslContext(kind));
            assertNotNull(config.getSslHostnameVerifier(kind));
            assertNotNull(config.getTrustManager(kind));
        });
    }

    @Test
    void digestAuth() {
        HubConfigImpl config = new RunFlowCommand().buildHubConfig();
        assertEquals("digest", config.getAuthMethod(DatabaseKind.STAGING));
        assertEquals("digest", config.getAuthMethod(DatabaseKind.FINAL));
        assertEquals("digest", config.getAuthMethod(DatabaseKind.JOB));

        Stream.of(DatabaseKind.STAGING, DatabaseKind.FINAL, DatabaseKind.JOB).forEach(kind -> {
            assertFalse(config.getSimpleSsl(kind));
            assertNull(config.getSslContext(kind));
            assertNull(config.getSslHostnameVerifier(kind));
            assertNull(config.getTrustManager(kind));
        });
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
