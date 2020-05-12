package com.marklogic.hub.central.controllers.steps;

import org.junit.jupiter.api.Test;

public class MappingStepControllerTest extends AbstractStepControllerTest {

    private final static String PATH = "/api/steps/mapping";

    public static MappingStepController.MappingInfo newDefaultMappingInfo() {
        MappingStepController.MappingInfo info = new MappingStepController.MappingInfo();
        info.name = "myMapper";
        info.description = "optional";
        info.selectedSource = "collection";
        info.sourceQuery = "cts.collectionQuery('test')";
        info.targetEntityType = "http://example.org/Customer-0.0.1/Customer";
        return info;
    }

    @Test
    void test() throws Exception {
        installReferenceModelProject();
        MappingStepController.MappingInfo info = newDefaultMappingInfo();
        verifyCommonStepEndpoints(PATH, info.toJsonNode(), "entity-services-mapping", "mapping");
    }
}
