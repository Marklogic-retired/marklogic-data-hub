/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.*;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.PluginModel;
import com.marklogic.quickstart.util.FileUtil;
import com.marklogic.spring.batch.hub.FlowConfig;
import com.marklogic.spring.batch.hub.StagingConfig;
import org.apache.commons.io.FileUtils;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.xml.parsers.ParserConfigurationException;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FlowManagerService {

    private static final String PROJECT_TMP_FOLDER = ".tmp";

    private EnvironmentConfig envConfig() {
        ConnectionAuthenticationToken authenticationToken = (ConnectionAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        return authenticationToken.getEnvironmentConfig();
    }

    private FlowManager fm = null;

    private FlowManager getFlowManager() {
        if (fm == null) {
            fm = new FlowManager(envConfig().getMlSettings());
        }
        return fm;
    }

    public List<FlowModel> getFlows(String projectDir, String entityName, FlowType flowType) {
        List<FlowModel> flows = new ArrayList<>();

        Path entityPath = Paths.get(projectDir, "plugins", "entities", entityName);

        Path flowPath = entityPath.resolve(flowType.toString());
        List<String> flowNames = FileUtil.listDirectFolders(flowPath.toFile());
        for (String flowName : flowNames) {
            if (flowName.equals("REST")) continue;

            Flow f = AbstractFlow.loadFromFile(flowPath.resolve(flowName).resolve(flowName + ".xml").toFile());
            FlowModel flow = new FlowModel(entityName, flowName);
            if (f != null) {
                flow.dataFormat = f.getDataFormat();
            }
            Path pluginsPath = flowPath.resolve(flowName);
            List<String> pluginNames = FileUtil.listDirectFolders(pluginsPath.toFile());
            for (String pluginName : pluginNames) {
                Path pluginPath = pluginsPath.resolve(pluginName);
                List<String> pluginFiles = FileUtil.listDirectFiles(pluginPath.toString());
                PluginModel pm = new PluginModel();
                pm.pluginType = pluginName;
                for (String pluginFile : pluginFiles) {
                    pm.files.add(pluginFile);
                }
                flow.plugins.add(pm);
            }
            flows.add(flow);
        }

        return flows;
    }

    public Flow getServerFlow(String entityName, String flowName, FlowType flowType) {
        FlowManager flowManager = getFlowManager();
        return flowManager.getFlow(entityName, flowName, flowType);
    }

    public JobExecution runFlow(Flow flow, int batchSize, int threadCount, FlowStatusListener statusListener) {

        FlowManager flowManager = getFlowManager();
        FlowRunner flowRunner = flowManager.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .onStatusChanged(statusListener);
        return flowRunner.run();
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

    public String getFlowMlcpOptionsFromFile(String entityName, String flowName) throws IOException {
        Path destFolder = Paths.get(envConfig().getProjectDir(), PROJECT_TMP_FOLDER);
        Path filePath = getMlcpOptionsFilePath(destFolder, entityName, flowName);
        File file = filePath.toFile();
        if(file.exists()) {
            byte[] encoded = Files.readAllBytes(filePath);
            return new String(encoded, StandardCharsets.UTF_8);
        }
        return "{ \"input_file_path\": \"" + envConfig().getProjectDir().replace("\\", "\\\\") + "\" }";
    }

    protected ConfigurableApplicationContext buildApplicationContext(FlowStatusListener statusListener) throws Exception {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
        ctx.register(StagingConfig.class);
        ctx.register(FlowConfig.class);
        ctx.register(RunInputFlowConfig.class);
        ctx.getBeanFactory().registerSingleton("hubConfig", envConfig().getMlSettings());
        ctx.getBeanFactory().registerSingleton("statusListener", statusListener);
        ctx.refresh();
        return ctx;
    }

    private JobParameters buildJobParameters(JsonNode json) throws ParserConfigurationException, IOException {
        JobParametersBuilder jpb = new JobParametersBuilder();
        jpb.addString("mlcpOptions", json.toString());
        jpb.addString("uid", UUID.randomUUID().toString());

        // convert the transform params into job params to be stored in ML for later reference
        JsonNode tp = json.get("transform_param");
        if (tp != null) {
            String transformParams = tp.textValue().replace("\"", "");
            String[] pairs = transformParams.split(",");

            for (String pair : pairs) {
                String[] tokens = pair.split("=");
                jpb.addString(tokens[0], tokens[1]);
            }
        }
        return jpb.toJobParameters();
    }

    public JobExecution runMlcp(JsonNode json, FlowStatusListener statusListener) {
        JobExecution result = null;
        try {
            ConfigurableApplicationContext ctx = buildApplicationContext(statusListener);
            JobParameters params = buildJobParameters(json);
            JobLauncher launcher = ctx.getBean(JobLauncher.class);
            Job job = ctx.getBean(Job.class);
            result = launcher.run(job, params);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
}
