/*
 * Copyright 2012-2019 MarkLogic Corporation
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

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.StepManager;
import com.marklogic.hub.util.FileUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class StepManagerTest extends HubTestBase {
    private String mappingStepName = "myTestMappingStep";
    private String ingestStepName = "myTestIngestStep";
    private String customStepName = "myTestCustomStep";


    @BeforeEach
    public void setup() {
        basicSetup();
        adminHubConfig.initHubProject();
    }

    @AfterEach
    public void teardown() {
        deleteProjectDir();
    }

    @Test
    void saveStep() {
        Step step = Step.create(mappingStepName, Step.StepType.MAPPING);
        stepManager.saveStep(step);

        String stepFileName = mappingStepName + StepManager.STEP_FILE_EXTENSION;
        assertTrue(Paths.get((getHubAdminConfig().getStepsDirByType(Step.StepType.MAPPING).toString()), step.getName(), stepFileName).toFile().exists());
    }

    @Test
    void deleteStep() {
        copyTestMappingStep();

        Step step = Step.create(mappingStepName, Step.StepType.MAPPING);

        stepManager.deleteStep(step);

        String stepFileName = mappingStepName + StepManager.STEP_FILE_EXTENSION;
        assertFalse(Paths.get((getHubAdminConfig().getStepsDirByType(Step.StepType.MAPPING).toString()), step.getName(), stepFileName).toFile().exists());
    }

    @Test
    void getAllSteps() {
        copyTestCustomStep();
        copyTestIngestStep();
        copyTestMappingStep();

        List<Step> stepList = stepManager.getSteps();
        assertTrue(stepList.size() > 0);
    }

    @Test
    void getStepByNameAndType() {
        copyTestMappingStep();
        copyTestIngestStep();

        Step step = stepManager.getStep(mappingStepName, Step.StepType.MAPPING);
        assertNotNull(step);
        assertEquals(mappingStepName, step.getName());
    }


    @Test
    void getStepsByType() {
        copyTestCustomStep();
        copyTestIngestStep();
        copyTestMappingStep();
        copyTestMappingStep2();

        ArrayList<Step> steps = stepManager.getStepsByType(Step.StepType.MAPPING);
        assertEquals(2, steps.size());
    }

    @Test
    void getAllStepNamesByType() {
        copyTestMappingStep();
        copyTestMappingStep2();

        ArrayList<String> stepNames = stepManager.getStepNamesByType(Step.StepType.MAPPING);
        assertEquals(2, stepNames.size());
    }

    private void copyTestMappingStep() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + mappingStepName + StepManager.STEP_FILE_EXTENSION), getHubAdminConfig().getStepsDirByType(Step.StepType.MAPPING).resolve(mappingStepName + "/" + mappingStepName + StepManager.STEP_FILE_EXTENSION).toFile());
    }

    private void copyTestIngestStep() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + ingestStepName + StepManager.STEP_FILE_EXTENSION), getHubAdminConfig().getStepsDirByType(Step.StepType.INGEST).resolve(ingestStepName + "/" + ingestStepName + StepManager.STEP_FILE_EXTENSION).toFile());
    }

    private void copyTestCustomStep() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + customStepName + StepManager.STEP_FILE_EXTENSION), getHubAdminConfig().getStepsDirByType(Step.StepType.CUSTOM).resolve(customStepName + "/" + customStepName + StepManager.STEP_FILE_EXTENSION).toFile());
    }

    private void copyTestMappingStep2() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + mappingStepName + "2" + StepManager.STEP_FILE_EXTENSION), getHubAdminConfig().getStepsDirByType(Step.StepType.MAPPING).resolve(mappingStepName + "2/" + mappingStepName + "2" + StepManager.STEP_FILE_EXTENSION).toFile());
    }
}
