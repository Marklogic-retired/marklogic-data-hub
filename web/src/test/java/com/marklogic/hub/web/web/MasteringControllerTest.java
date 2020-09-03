package com.marklogic.hub.web.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.hub.web.AbstractWebTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MasteringControllerTest extends AbstractWebTest {

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
