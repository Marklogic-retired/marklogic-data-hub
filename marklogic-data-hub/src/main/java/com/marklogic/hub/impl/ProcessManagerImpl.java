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

package com.marklogic.hub.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.ProcessManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.processes.Process;
import com.marklogic.hub.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;

@Component
public class ProcessManagerImpl implements ProcessManager {

    @Autowired
    private HubConfig hubConfig;

    @Override
    public void saveProcess(Process process) {
        try {
            String processString = process.serialize();
            Path dir = resolvePath(hubConfig.getProcessDir(process.getType()), process.getName());
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }
            String processFileName = process.getName() + PROCESSES_FILE_EXTENSION;
            File file = Paths.get(dir.toString(), processFileName).toFile();
            //create the object mapper to pretty print to disk
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
            Object json = objectMapper.readValue(processString, Object.class);
            FileOutputStream fileOutputStream = new FileOutputStream(file);
            fileOutputStream.write(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(json).getBytes());
            fileOutputStream.flush();
            fileOutputStream.close();
        }
        catch (JsonProcessingException e) {
            throw new DataHubProjectException("Could not serialize Process for project.");
        }
        catch (IOException e) {
            throw new DataHubProjectException("Could not write Process to disk for project.");
        }
    }

    @Override
    public void deleteProcess(Process process) {
        Path dir = resolvePath(hubConfig.getProcessDir(process.getType()), process.getName());
        if (dir.toFile().exists()) {
            try {
                FileUtils.deleteDirectory(dir.toFile());
            }
            catch (IOException e) {
                throw new DataHubProjectException("Could not delete Process for project.");
            }
        }
    }

    @Override
    public ArrayList<Process> getProcesses() {
        ArrayList<Process> processList = new ArrayList<>();
        for (Process.ProcessType processType : Process.ProcessType.getProcessTypes()) {
            for (String name : getProcessNamesByType(processType)) {
                processList.add(getProcess(name, processType));
            }
        }
        return processList;
    }

    @Override
    public Process getProcess(String name, Process.ProcessType type) {
        Path processPath = resolvePath(hubConfig.getProcessDir(type), name);

        try {
            String targetFileName = name + PROCESSES_FILE_EXTENSION;
            FileInputStream fileInputStream = new FileInputStream(processPath.resolve(targetFileName).toFile());
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode node = objectMapper.readTree(fileInputStream);
            Process newProcess = createProcessFromJSON(node);
            if (newProcess != null && newProcess.getName().length() > 0) {
                return newProcess;
            }
        }
        catch (IOException e) {
            throw new DataHubProjectException("Could not read mapping on disk.");
        }

        return null;
    }

    @Override
    public ArrayList<Process> getProcessesByType(Process.ProcessType type) {
        ArrayList<Process> processList = new ArrayList<>();
        for (String name : getProcessNamesByType(type)) {
            processList.add(getProcess(name, type));
        }
        return processList;
    }

    @Override
    public ArrayList<String> getProcessNamesByType(Process.ProcessType type) {
        return (ArrayList<String>) FileUtil.listDirectFolders(hubConfig.getProcessDir(type));
    }

    @Override
    public Process createProcessFromJSON(JsonNode json) {
        Process process = Process.create("default", Process.ProcessType.INGEST);
        process.deserialize(json);
        return process;
    }

    private Path resolvePath(Path path, String more) {
        return path.resolve(more);
    }
}
