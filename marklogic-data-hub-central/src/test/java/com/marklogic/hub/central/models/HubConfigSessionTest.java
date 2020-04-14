package com.marklogic.hub.central.models;

import com.marklogic.hub.central.AbstractHubCentralTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class HubConfigSessionTest extends AbstractHubCentralTest {

    @BeforeEach
    void before() {
        runAsDataHubDeveloper();
    }

    @Test
    public void databaseClientKindsTest() {
        assertEquals(hubConfig.getAllDatabaseClients().size(), 2);
        hubConfig.destroy();
        assertEquals(hubConfig.getAllDatabaseClients().size(), 0);
    }

    @Test
    public void databaseClientsTest() {
        assertEquals(hubConfig.getAllDatabaseClients().values().stream()
            .flatMap(s -> s.values().stream().filter(
                Objects::nonNull)).count(), 5);
        hubConfig.destroy();
        assertEquals(hubConfig.getAllDatabaseClients().size(), 0);
    }
}
