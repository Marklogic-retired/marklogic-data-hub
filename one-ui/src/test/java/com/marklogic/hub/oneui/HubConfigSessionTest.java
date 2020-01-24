package com.marklogic.hub.oneui;

import java.util.Objects;

import com.marklogic.hub.oneui.models.HubConfigSession;
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

    @BeforeEach
    void before() {
        testHelper.authenticateSession();
    }

    @Test
    public void databaseClientKindsTest() {
        HubConfigSession hubConfig = testHelper.hubConfig;
        assertEquals(hubConfig.getAllDatabaseClients().size(), 2);
        testHelper.hubConfig.destroy();
        assertEquals(hubConfig.getAllDatabaseClients().size(), 0);
    }

    @Test
    public void databaseClientsTest() {
        HubConfigSession hubConfig = testHelper.hubConfig;
        assertEquals(hubConfig.getAllDatabaseClients().values().stream()
            .flatMap(s -> s.values().stream().filter(
                Objects::nonNull)).count(), 4);
        testHelper.hubConfig.destroy();
        assertEquals(hubConfig.getAllDatabaseClients().size(), 0);
    }
}
