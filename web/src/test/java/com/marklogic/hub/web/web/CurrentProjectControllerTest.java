package com.marklogic.hub.web.web;

import com.marklogic.hub.web.AbstractWebTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class CurrentProjectControllerTest extends AbstractWebTest {

    @Autowired
    CurrentProjectController controller;

    @Test
    void testGetEnvironment() throws Exception {
        String environment = controller.getEnvironment();
        assertNotNull(environment, "This test was added to provide at least minimal coverage of the " +
            "controller class to ensure that it autowires up correctly");
    }
}
