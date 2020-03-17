package com.marklogic.hub.oneui.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.oneui.TestHelper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class EnvironmentServiceTest extends TestHelper{

    @Autowired
    EnvironmentService environmentService;

    @BeforeEach
    void before(){
        authenticateSession();
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
