/*
 * Copyright (c) 2020 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.marklogic.hub.step;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.StepDefinitionManager;
import com.marklogic.hub.util.FileUtil;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class StepDefinitionManagerTest extends AbstractHubCoreTest {

    private String mappingStepName = "myTestMappingStep";
    private String ingestStepName = "myTestIngestStep";
    private String customStepName = "myTestCustomStep";

    @Autowired
    StepDefinitionManager stepDefinitionManager;

    @Test
    void saveStep() {
        StepDefinition stepDefinition = StepDefinition.create(mappingStepName, StepDefinition.StepDefinitionType.MAPPING);
        Assertions.assertEquals("/data-hub/5/builtins/steps/mapping/entity-services/main.sjs", stepDefinition.getModulePath());
        stepDefinitionManager.saveStepDefinition(stepDefinition);

        String stepFileName = mappingStepName + StepDefinitionManager.STEP_DEFINITION_FILE_EXTENSION;
        assertTrue(Paths.get((getHubProject().getStepDefinitionPath(StepDefinition.StepDefinitionType.MAPPING).toString()), stepDefinition.getName(), stepFileName).toFile().exists());
    }

    @Test
    void deleteStep() {
        copyTestMappingStep();

        StepDefinition stepDefinition = StepDefinition.create(mappingStepName, StepDefinition.StepDefinitionType.MAPPING);

        stepDefinitionManager.deleteStepDefinition(stepDefinition);

        String stepFileName = mappingStepName + StepDefinitionManager.STEP_DEFINITION_FILE_EXTENSION;
        assertFalse(Paths.get((getHubProject().getStepDefinitionPath(StepDefinition.StepDefinitionType.MAPPING).toString()), stepDefinition.getName(), stepFileName).toFile().exists());
    }

    @Test
    void getAllSteps() {
        copyTestCustomStep();
        copyTestIngestStep();
        copyTestMappingStep();

        List<StepDefinition> stepDefinitionListList = stepDefinitionManager.getStepDefinitions();
        assertTrue(stepDefinitionListList.size() > 0);
    }

    @Test
    void getStepByNameAndType() {
        copyTestMappingStep();
        copyTestIngestStep();

        StepDefinition stepDefinition = stepDefinitionManager.getStepDefinition(mappingStepName, StepDefinition.StepDefinitionType.MAPPING);
        assertNotNull(stepDefinition);
        assertEquals(mappingStepName, stepDefinition.getName());
    }


    @Test
    void getStepsByType() {
        copyTestCustomStep();
        copyTestIngestStep();
        copyTestMappingStep();
        copyTestMappingStep2();

        List<StepDefinition> stepDefinitionList = stepDefinitionManager.getStepDefinitionsByType(StepDefinition.StepDefinitionType.MAPPING);
        assertEquals(2, stepDefinitionList.size());
    }

    @Test
    void getAllStepNamesByType() {
        copyTestMappingStep();
        copyTestMappingStep2();

        ArrayList<String> stepNames = stepDefinitionManager.getStepDefinitionNamesByType(StepDefinition.StepDefinitionType.MAPPING);
        assertEquals(2, stepNames.size());
    }

    private void copyTestMappingStep() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + mappingStepName + StepDefinitionManager.STEP_DEFINITION_FILE_EXTENSION),
            getHubProject().getStepDefinitionPath(StepDefinition.StepDefinitionType.MAPPING).resolve(mappingStepName + "/" + mappingStepName + StepDefinitionManager.STEP_DEFINITION_FILE_EXTENSION).toFile());
    }

    private void copyTestIngestStep() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + ingestStepName + StepDefinitionManager.STEP_DEFINITION_FILE_EXTENSION),
            getHubProject().getStepDefinitionPath(StepDefinition.StepDefinitionType.INGESTION).resolve(ingestStepName + "/" + ingestStepName + StepDefinitionManager.STEP_DEFINITION_FILE_EXTENSION).toFile());
    }

    private void copyTestCustomStep() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + customStepName + StepDefinitionManager.STEP_DEFINITION_FILE_EXTENSION),
            getHubProject().getStepDefinitionPath(StepDefinition.StepDefinitionType.CUSTOM).resolve(customStepName + "/" + customStepName + StepDefinitionManager.STEP_DEFINITION_FILE_EXTENSION).toFile());
    }

    private void copyTestMappingStep2() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + mappingStepName + "2" + StepDefinitionManager.STEP_DEFINITION_FILE_EXTENSION),
            getHubProject().getStepDefinitionPath(StepDefinition.StepDefinitionType.MAPPING).resolve(mappingStepName + "2/" + mappingStepName + "2" + StepDefinitionManager.STEP_DEFINITION_FILE_EXTENSION).toFile());
    }
}
