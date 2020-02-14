package com.marklogic.hub.oneui.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.oneui.Application;
import com.marklogic.hub.oneui.TestHelper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {Application.class, ApplicationConfig.class, EnvironmentServiceTest.class})
public class EnvironmentServiceTest {

    @Autowired
    EnvironmentService environmentService;

    @Autowired
    private TestHelper testHelper;

    @BeforeEach
    void before(){
        testHelper.authenticateSession();
    }

    @Test
    void testGetProjectInfo(){
        JsonNode resp = environmentService.getProjectInfo();
        Assertions.assertNotNull(resp);
        Assertions.assertNotNull(resp.get("dataHubVersion"));
        Assertions.assertNotNull(resp.get("projectName"));
        Assertions.assertNotNull(resp.get("projectDir"));
        Assertions.assertNotNull(resp.get("marklogicVersion"));
    }
}
