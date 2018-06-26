/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.FlowStatusListener;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.util.MlcpRunner;
import com.marklogic.quickstart.EnvironmentAware;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.PluginModel;
import com.marklogic.quickstart.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FlowManagerService extends EnvironmentAware {

    private static final String PROJECT_TMP_FOLDER = ".tmp";

    private FlowManager flowManager;

    // before login, flowManager is null, so check each time.
    private FlowManager flowManager() {
        if (flowManager != null) return flowManager;
        else return flowManager = FlowManager.create(envConfig().getMlSettings());
    }

    public List<FlowModel> getFlows(String projectDir, String entityName, FlowType flowType) {
        Path entityPath = Paths.get(projectDir, "plugins", "entities", entityName);
        return flowManager().getLocalFlowsForEntity(entityName, flowType).stream().map(flow -> {
            FlowModel flowModel = new FlowModel(entityName, flow.getName());
            flowModel.codeFormat = flow.getCodeFormat();
            flowModel.dataFormat = flow.getDataFormat();
            flowModel.flowType = flow.getType();

            Path flowPath = entityPath.resolve(flowType.toString()).resolve(flow.getName());
            List<String> pluginNames = FileUtil.listDirectFolders(flowPath.toFile());
            for (String pluginName : pluginNames) {
                Path pluginPath = flowPath.resolve(pluginName);
                List<String> pluginFiles = FileUtil.listDirectFiles(pluginPath.toString());
                PluginModel pm = new PluginModel();
                pm.pluginType = pluginName;
                for (String pluginFile : pluginFiles) {
                    pm.pluginPath = pluginPath.resolve(pluginFile).toString();
                    try {
                        pm.fileContents = new String(Files.readAllBytes(pluginPath.resolve(pluginFile)));
                    } catch (IOException e) {}
                }

                flowModel.plugins.add(pm);
            }

            File[] pluginFiles = flowPath.toFile().listFiles(pathname -> pathname.isFile() && !pathname.getName().endsWith("properties"));
            for (File pluginFile : pluginFiles) {
                PluginModel pm = new PluginModel();
                pm.pluginType = FilenameUtils.getBaseName(pluginFile.getName());
                pm.pluginPath = pluginFile.getAbsolutePath();
                try {
                    pm.fileContents = new String(Files.readAllBytes(pluginFile.toPath()));
                } catch (IOException e) {}
                flowModel.plugins.add(pm);
            }

            flowModel.plugins.sort(Comparator.comparing(o -> o.pluginType));

            return flowModel;
        }).collect(Collectors.toList());
    }

    public Flow getServerFlow(String entityName, String flowName, FlowType flowType) {
        return flowManager().getFlow(entityName, flowName, flowType);
    }

    public JobTicket runFlow(Flow flow, int batchSize, int threadCount, Map<String, Object> options, FlowStatusListener statusListener) {

        FlowRunner flowRunner = flowManager().newFlowRunner()
            .withFlow(flow)
            .withOptions(options)
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .onStatusChanged(statusListener);
        return flowRunner.run();
    }

    private Path getHarmonizeOptionsFilePath(Path destFolder, String entityName, String flowName) {
        return destFolder.resolve(entityName + "-harmonize-" + flowName + ".txt");
    }

    public Map<String, Object> getHarmonizeFlowOptionsFromFile(String entityName, String flowName) throws IOException {
        Path destFolder = Paths.get(envConfig().getProjectDir(), PROJECT_TMP_FOLDER);
        Path filePath = getHarmonizeOptionsFilePath(destFolder, entityName, flowName);
        File file = filePath.toFile();
        if(file.exists()) {
            return new ObjectMapper().readValue(file, Map.class);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("harmonize_file_path", envConfig().getProjectDir());
        return result;
    }

    public void saveOrUpdateHarmonizeFlowOptionsToFile(String entityName, String flowName, String harmonizeOptionsFileContent) throws IOException {
        Path destFolder = Paths.get(envConfig().getProjectDir(), PROJECT_TMP_FOLDER);
        File destFolderFile = destFolder.toFile();
        if (!destFolderFile.exists()) {
            FileUtils.forceMkdir(destFolderFile);
        }
        Path filePath = getHarmonizeOptionsFilePath(destFolder, entityName, flowName);
        FileWriter fw = new FileWriter(filePath.toString());
        BufferedWriter bw = new BufferedWriter(fw);
        bw.write(harmonizeOptionsFileContent);
        bw.close();
    }


    private Path getMlcpOptionsFilePath(Path destFolder, String entityName, String flowName) {
        return destFolder.resolve(entityName + "-" + flowName + ".txt");
    }

    public void saveOrUpdateFlowMlcpOptionsToFile(String entityName, String flowName, String mlcpOptionsFileContent) throws IOException {
        Path destFolder = Paths.get(envConfig().getProjectDir(), PROJECT_TMP_FOLDER);
        File destFolderFile = destFolder.toFile();
        if (!destFolderFile.exists()) {
            FileUtils.forceMkdir(destFolderFile);
        }
        Path filePath = getMlcpOptionsFilePath(destFolder, entityName, flowName);
        FileWriter fw = new FileWriter(filePath.toString());
        BufferedWriter bw = new BufferedWriter(fw);
        bw.write(mlcpOptionsFileContent);
        bw.close();
    }

    public Map<String, Object> getFlowMlcpOptionsFromFile(String entityName, String flowName) throws IOException {
        Path destFolder = Paths.get(envConfig().getProjectDir(), PROJECT_TMP_FOLDER);
        Path filePath = getMlcpOptionsFilePath(destFolder, entityName, flowName);
        File file = filePath.toFile();
        if(file.exists()) {
            return new ObjectMapper().readValue(file, Map.class);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("input_file_path", envConfig().getProjectDir());
        return result;
    }

    public void runMlcp(Flow flow, JsonNode json, FlowStatusListener statusListener) {
        String mlcpPath = json.get("mlcpPath").textValue();
        HubConfig hubConfig = envConfig().getMlSettings();
        MlcpRunner runner = new MlcpRunner(mlcpPath, "com.marklogic.contentpump.ContentPump", hubConfig, flow, hubConfig.newStagingManageClient(), json.get("mlcpOptions"), statusListener);
        runner.start();
    }
}
