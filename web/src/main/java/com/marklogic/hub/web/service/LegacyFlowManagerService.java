/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.legacy.LegacyFlowManager;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.legacy.flow.LegacyFlow;
import com.marklogic.hub.legacy.flow.LegacyFlowRunner;
import com.marklogic.hub.legacy.flow.LegacyFlowStatusListener;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.MlcpRunner;
import com.marklogic.hub.web.model.FlowModel;
import com.marklogic.hub.web.model.PluginModel;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LegacyFlowManagerService {

    private static final String PROJECT_TMP_FOLDER = ".tmp";

    @Autowired
    private LegacyFlowManager flowManager;

    @Autowired
    private HubConfigImpl hubConfig;


    public List<FlowModel> getFlows(String entityName, FlowType flowType) {
        Path entityPath = hubConfig.getHubProject().getLegacyHubEntitiesDir().resolve(entityName);
        return flowManager.getLocalFlowsForEntity(entityName, flowType).stream().map(flow -> {
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
            if (pluginFiles != null) {
                for (File pluginFile : pluginFiles) {
                    PluginModel pm = new PluginModel();
                    pm.pluginType = FilenameUtils.getBaseName(pluginFile.getName());
                    pm.pluginPath = pluginFile.getAbsolutePath();
                    try {
                        pm.fileContents = new String(Files.readAllBytes(pluginFile.toPath()));
                    } catch (IOException e) {
                    }
                    flowModel.plugins.add(pm);
                }
            }

            flowModel.plugins.sort(Comparator.comparing(o -> o.pluginType));

            return flowModel;
        }).collect(Collectors.toList());
    }

    public LegacyFlow getServerFlow(String entityName, String flowName, FlowType flowType) {
        return flowManager.getFlow(entityName, flowName, flowType);
    }

    public JobTicket runFlow(LegacyFlow flow, int batchSize, int threadCount, Map<String, Object> options, LegacyFlowStatusListener statusListener) {

        LegacyFlowRunner flowRunner = flowManager.newFlowRunner()
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
        Path destFolder = hubConfig.getHubProjectDir().resolve(PROJECT_TMP_FOLDER);
        Path filePath = getHarmonizeOptionsFilePath(destFolder, entityName, flowName);
        File file = filePath.toFile();
        if(file.exists()) {
            return new ObjectMapper().readValue(file, Map.class);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("harmonize_file_path", hubConfig.getHubConfigDir());
        return result;
    }

    public void saveOrUpdateHarmonizeFlowOptionsToFile(String entityName, String flowName, String harmonizeOptionsFileContent) throws IOException {
        Path destFolder = hubConfig.getHubProjectDir().resolve(PROJECT_TMP_FOLDER);
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
        Path destFolder = hubConfig.getHubProjectDir().resolve(PROJECT_TMP_FOLDER);
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
        Path destFolder = hubConfig.getHubProjectDir().resolve(PROJECT_TMP_FOLDER);
        Path filePath = getMlcpOptionsFilePath(destFolder, entityName, flowName);
        File file = filePath.toFile();
        if(file.exists()) {
            return new ObjectMapper().readValue(file, Map.class);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("input_file_path", hubConfig.getHubProject().getProjectDirString());
        return result;
    }

    public void runMlcp(LegacyFlow flow, JsonNode json, LegacyFlowStatusListener statusListener) {
        String mlcpPath = json.get("mlcpPath").textValue();
        MlcpRunner runner = new MlcpRunner(mlcpPath, "com.marklogic.contentpump.ContentPump", hubConfig, flow, hubConfig.newStagingClient(), json.get("mlcpOptions"), statusListener);
        runner.start();
    }

    public LegacyFlowManager getFlowManager() {
        return flowManager;
    }
}
