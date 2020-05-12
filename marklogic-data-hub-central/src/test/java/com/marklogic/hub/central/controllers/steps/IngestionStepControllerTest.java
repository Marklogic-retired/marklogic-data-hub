package com.marklogic.hub.central.controllers.steps;

import org.junit.jupiter.api.Test;

public class IngestionStepControllerTest extends AbstractStepControllerTest {

    private final static String PATH = "/api/steps/ingestion";

    @Test
    void test() throws Exception {
        IngestionStepController.IngestionInfo info = new IngestionStepController.IngestionInfo();
        info.name = "myIngestionStep";
        info.description = "the description";
        info.sourceFormat = "json";
        info.targetFormat = "json";

        verifyCommonStepEndpoints(PATH, objectMapper.valueToTree(info), "default-ingestion", "ingestion");
    }
}
