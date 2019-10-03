package com.marklogic.hub.step.impl;

import com.marklogic.hub.step.StepDefinition;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class MappingStepDefinitionImplTest  {

    @Test
    void testMappingStepDef(){
        StepDefinition testMap = StepDefinition.create("testMap", StepDefinition.StepDefinitionType.MAPPING);
        Assertions.assertEquals("/data-hub/5/builtins/steps/mapping/entity-services/main.sjs", testMap.getModulePath(),"Versions is null, so module path should be set to es");
    }

}
