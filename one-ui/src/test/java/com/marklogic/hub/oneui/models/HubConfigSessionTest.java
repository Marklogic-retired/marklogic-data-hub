package com.marklogic.hub.oneui.models;

import com.marklogic.hub.oneui.TestHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class HubConfigSessionTest extends TestHelper {

    @Autowired
    private HubConfigSession hubConfig;

    @BeforeEach
    void before() {
        authenticateSession();
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
