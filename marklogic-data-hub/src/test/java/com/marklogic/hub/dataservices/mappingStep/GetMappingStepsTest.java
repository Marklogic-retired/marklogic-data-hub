package com.marklogic.hub.dataservices.mappingStep;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.ArtifactService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class GetMappingStepsTest extends AbstractHubCoreTest {

    @Test
    void test() {
        installProjectInFolder("test-projects/all-artifacts");

        DatabaseClient client = getHubClient().getStagingClient();

        JsonNode stepsByEntity = ArtifactService.on(client).getList("mapping");
        assertEquals(2, stepsByEntity.size(), "Expecting two entries, one for Order and one for Person");

        JsonNode mappingSteps = stepsByEntity.get(0).get("entityType").asText().equals("Order") ?
            stepsByEntity.get(0).get("artifacts") :
            stepsByEntity.get(1).get("artifacts");
        assertEquals(2, mappingSteps.size(), "Expecting the two mapping steps - the legacy mapping should not be included " +
            "since it cannot be used in Hub Central");
    }
}
