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

package com.marklogic.hub.processes;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.ProcessManager;
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
public class ProcessManagerTest extends HubTestBase {
    private String mappingProcessName = "myTestMappingProcess";
    private String ingestProcessName = "myTestIngestProcess";
    private String customProcessName = "myTestCustomProcess";


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
    void saveProcess() {
        Process process = Process.create(mappingProcessName, Process.ProcessType.MAPPING);
        processManager.saveProcess(process);

        String processFileName = mappingProcessName + ProcessManager.PROCESSES_FILE_EXTENSION;
        assertTrue(Paths.get((getHubAdminConfig().getProcessDir(Process.ProcessType.MAPPING).toString()), process.getName(), processFileName).toFile().exists());
    }

    @Test
    void deleteProcess() {
        copyTestMappingProcess();

        Process process = Process.create(mappingProcessName, Process.ProcessType.MAPPING);

        processManager.deleteProcess(process);

        String processFileName = mappingProcessName + ProcessManager.PROCESSES_FILE_EXTENSION;
        assertFalse(Paths.get((getHubAdminConfig().getProcessDir(Process.ProcessType.MAPPING).toString()), process.getName(), processFileName).toFile().exists());
    }

    @Test
    void getAllProcesses() {
        copyTestCustomProcess();
        copyTestIngestProcess();
        copyTestMappingProcess();

        List<Process> processList = processManager.getProcesses();
        assertTrue(processList.size() > 0);
    }

    @Test
    void getProcessByNameAndType() {
        copyTestMappingProcess();
        copyTestIngestProcess();

        Process process = processManager.getProcess(mappingProcessName, Process.ProcessType.MAPPING);
        assertNotNull(process);
        assertEquals(mappingProcessName, process.getName());
    }


    @Test
    void getProcessesByType() {
        copyTestCustomProcess();
        copyTestIngestProcess();
        copyTestMappingProcess();
        copyTestMappingProcess2();

        ArrayList<Process> processes = processManager.getProcessesByType(Process.ProcessType.MAPPING);
        assertEquals(2, processes.size());
    }

    @Test
    void getAllProcessNamesByType() {
        copyTestMappingProcess();
        copyTestMappingProcess2();

        ArrayList<String> processNames = processManager.getProcessNamesByType(Process.ProcessType.MAPPING);
        assertEquals(2, processNames.size());
    }

    private void copyTestMappingProcess() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + mappingProcessName + ProcessManager.PROCESSES_FILE_EXTENSION), getHubAdminConfig().getProcessDir(Process.ProcessType.MAPPING).resolve(mappingProcessName + "/" + mappingProcessName + ProcessManager.PROCESSES_FILE_EXTENSION).toFile());
    }

    private void copyTestIngestProcess() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + ingestProcessName + ProcessManager.PROCESSES_FILE_EXTENSION), getHubAdminConfig().getProcessDir(Process.ProcessType.INGEST).resolve(ingestProcessName + "/" + ingestProcessName + ProcessManager.PROCESSES_FILE_EXTENSION).toFile());
    }

    private void copyTestCustomProcess() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + customProcessName + ProcessManager.PROCESSES_FILE_EXTENSION), getHubAdminConfig().getProcessDir(Process.ProcessType.CUSTOM).resolve(customProcessName + "/" + customProcessName + ProcessManager.PROCESSES_FILE_EXTENSION).toFile());
    }

    private void copyTestMappingProcess2() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + mappingProcessName + "2" + ProcessManager.PROCESSES_FILE_EXTENSION), getHubAdminConfig().getProcessDir(Process.ProcessType.MAPPING).resolve(mappingProcessName + "2/" + mappingProcessName + "2" + ProcessManager.PROCESSES_FILE_EXTENSION).toFile());
    }
}
