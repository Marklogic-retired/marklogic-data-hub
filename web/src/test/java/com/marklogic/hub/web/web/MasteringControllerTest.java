package com.marklogic.hub.web.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.web.WebApplication;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {WebApplication.class, ApplicationConfig.class, MasteringControllerTest.class})
@WebAppConfiguration
class MasteringControllerTest extends BaseTestController {

    @Autowired
    MasteringController controller;

    @Test
    void verifyThatCorrectDatabaseClientIsUsed() {
        JsonNode node = controller.getDefaultCollection("Order");

        ArrayNode array = (ArrayNode) node.get("onMerge");
        assertEquals("sm-Order-mastered", array.get(0).asText(),
            "The unit test for the endpoint verifies all the collections; this test is here to ensure that a valid " +
                "DatabaseClient is used by the controller to connect to MarkLogic");
    }
}
