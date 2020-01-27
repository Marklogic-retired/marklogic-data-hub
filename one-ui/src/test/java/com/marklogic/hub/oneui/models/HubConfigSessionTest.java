package com.marklogic.hub.oneui.models;

import java.util.Objects;

import com.marklogic.hub.oneui.Application;
import com.marklogic.hub.oneui.TestHelper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {Application.class})
public class HubConfigSessionTest {

    @Autowired
    private TestHelper testHelper;

    @Autowired
    private HubConfigSession hubConfig;

    @BeforeEach
    void before() {
        testHelper.authenticateSession();
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
                Objects::nonNull)).count(), 4);
        hubConfig.destroy();
        assertEquals(hubConfig.getAllDatabaseClients().size(), 0);
    }
}
