package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.controllers.MatchingController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public class MatchingControllerTest extends AbstractHubCentralTest {

    @Autowired
    MatchingController controller;

    static final String MATCHING_CONFIG_1 = "{\n" +
        "  \"name\": \"TestCustomerMatching\",\n" +
        "  \"targetEntityType\": \"Customer\",\n" +
        "  \"description\": \"TestCustomerMatching does ...\",\n" +
        "  \"selectedSource\":\"query\",\n" +
        "  \"sourceQuery\": \"cts.CollectionQuery('RAW-CUSTOMER')\",\n" +
        "  \"collections\": []\n" +
        "}";

    static final String MATCHING_CONFIG_2 = "{\n" +
        "  \"name\": \"TestOrderMatching1\",\n" +
        "  \"targetEntityType\": \"Order\",\n" +
        "  \"description\": \"TestOrderMatching1 does ...\",\n" +
        "  \"selectedSource\": \"collection\",\n" +
        "  \"sourceQuery\": \"\",\n" +
        "  \"collections\": [\"RAW-ORDER\"]\n" +
        "}";

    static final String MATCHING_CONFIG_3 = "{\n" +
        "  \"name\" : \"TestOrderMatching2\",\n" +
        "  \"targetEntityType\" : \"Order\",\n" +
        "  \"description\" : \"TestOrderMatching2 does ...\",\n" +
        "  \"selectedSource\": \"query\",\n" +
        "  \"sourceQuery\": \"cts.CollectionQuery('RAW-ORDER')\",\n" +
        "  \"collections\": []\n" +
        "}";

    @Test
    void testMatchingConfigs() {
        installReferenceModelProject();

        controller.updateMatching("TestCustomerMatching", readJsonObject(MATCHING_CONFIG_1));
        controller.updateMatching("TestOrderMatching1", readJsonObject(MATCHING_CONFIG_2));
        controller.updateMatching("TestOrderMatching2", readJsonObject(MATCHING_CONFIG_3));

        ArrayNode configsGroupbyEntity = controller.getMatchings().getBody();
        assertEquals(2, configsGroupbyEntity.size(), "Should be two items in the array - one for each entity type");

        configsGroupbyEntity.forEach(e -> {
            String currEntityName = e.get("entityType").asText();
            if ("Customer".equals(currEntityName) || "Order".equals(currEntityName)) {
                JsonNode matchingNode = e.get("artifacts");
                assertTrue(e.get("artifacts").size() > 0, String.format("Should have at least 1 matching config associated with the entity (%s).", currEntityName));
                if (matchingNode instanceof ArrayNode) {
                    boolean found = false;
                    int matchConfigCount = 0;
                    int i = 0;
                    for (; i < matchingNode.size(); ++i) {
                        String matchingEntityName = matchingNode.get(i).get("targetEntityType").asText();
                        String matchName = matchingNode.get(i).get("name").asText();
                        if (("Customer".equals(currEntityName) && currEntityName.equals(matchingEntityName) && "TestCustomerMatching".equals(matchName))
                            || ("Order".equals(currEntityName) && currEntityName.equals(matchingEntityName)
                            && ("TestOrderMatching1".equals(matchName) || "TestOrderMatching2".equals(matchName)))) {
                            found = true;
                            ++matchConfigCount;
                        }
                    }
                    assertTrue(found, String.format("Could not find the entity name (%s)", currEntityName));
                    if ("Customer".equals(currEntityName)) {
                        assertEquals(1, matchConfigCount, "Should have 1 matching config associate with the entity (Customer).");
                    } else { //Order
                        assertEquals(2, matchConfigCount, "Should have 2 matching configs associate with the entity (Order).");
                    }
                } else if (matchingNode instanceof ObjectNode) {
                    assertEquals(currEntityName, matchingNode.get("targetEntityType").asText(), "mismatch entity name.");
                    if ("Customer".equals(currEntityName)) {
                        assertEquals("TestCustomerMatching", matchingNode.get("name").asText(), "mismatch matching name.");
                    } else { //Order
                        fail("Should have 2 matching configs associate with the entity (Order).");
                    }
                } else {
                    fail("error data type!");
                }
            }
        });

        controller.deleteMatching("TestCustomerMatching");
        controller.deleteMatching("TestOrderMatching1");
        controller.deleteMatching("TestOrderMatching2");
        configsGroupbyEntity = controller.getMatchings().getBody();
        configsGroupbyEntity.forEach(item -> {
            ArrayNode artifacts = (ArrayNode)item.get("artifacts");
            assertEquals(0, artifacts.size());
        });
    }
}
