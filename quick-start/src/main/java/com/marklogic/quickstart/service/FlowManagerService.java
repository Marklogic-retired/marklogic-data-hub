package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.marklogic.client.helper.LoggingObject;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.JobStatusListener;
import com.marklogic.hub.flow.AbstractFlow;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FlowManagerService extends LoggingObject{

    private static final String PROJECT_TMP_FOLDER = ".tmp";
    @Autowired
    private EnvironmentConfig envConfig;

    public FlowManager getFlowManager() {
        return new FlowManager(envConfig.getMlSettings());
    }

    public List<FlowModel> getFlows(String projectDir, String entityName, FlowType flowType) {
        List<FlowModel> flows = new ArrayList<FlowModel>();

        Path entityPath = Paths.get(projectDir, "plugins", "entities", entityName);

        Path flowPath = entityPath.resolve(flowType.toString());
        List<String> flowNames = FileUtil.listDirectFolders(flowPath.toFile());
        for (String flowName : flowNames) {
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

    public JobExecution runFlow(Flow flow, int batchSize, JobStatusListener statusListener) {

        FlowManager flowManager = getFlowManager();
        return flowManager.runFlow(flow, batchSize, statusListener);
    }

    private Path getMlcpOptionsFilePath(Path destFolder, String entityName, String flowName) {
        return destFolder.resolve(entityName + "-" + flowName + ".txt");
    }

    public void saveOrUpdateFlowMlcpOptionsToFile(String entityName, String flowName, String mlcpOptionsFileContent) throws IOException {
        Path destFolder = Paths.get(envConfig.getProjectDir(), PROJECT_TMP_FOLDER);
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
        Path destFolder = Paths.get(envConfig.getProjectDir(), PROJECT_TMP_FOLDER);
        Path filePath = getMlcpOptionsFilePath(destFolder, entityName, flowName);
        File file = filePath.toFile();
        if(file.exists()) {
            return Files.toString(file, Charsets.UTF_8);
        }
        return "{ \"input_file_path\": \"" + envConfig.getProjectDir().replace("\\", "\\\\") + "\" }";
    }

    protected ConfigurableApplicationContext buildApplicationContext(JobStatusListener statusListener) throws Exception {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
        ctx.register(StagingConfig.class);
        ctx.register(FlowConfig.class);
        ctx.register(RunInputFlowConfig.class);
        ctx.getBeanFactory().registerSingleton("hubConfig", envConfig.getMlSettings());
        ctx.getBeanFactory().registerSingleton("statusListener", statusListener);
        ctx.refresh();
        return ctx;
    }

    private JobParameters buildJobParameters(JsonNode json) throws ParserConfigurationException, IOException, SAXException {
        JobParametersBuilder jpb = new JobParametersBuilder();
        jpb.addString("mlcpOptions", json.toString());
        jpb.addString("uid", UUID.randomUUID().toString());

        // convert the transform params into job params to be stored in ML for later reference
        JsonNode tp = json.get("transform_param");
        if (tp != null) {
            String transformParams = tp.textValue();
            transformParams = transformParams.replace("\"", "");
            logger.info("transformParams: " + transformParams);
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            ByteArrayInputStream bis = new ByteArrayInputStream(transformParams.getBytes(StandardCharsets.UTF_8));
            Document doc = builder.parse(bis);
            bis.close();

            NodeList nodes = doc.getElementsByTagName("params");
            if (nodes.getLength() == 1) {
                Node params = nodes.item(0);
                NodeList childNodes = params.getChildNodes();
                for (int i = 0; i < childNodes.getLength(); i++) {
                    Node child = childNodes.item(i);
                    if (child.getNodeType() == Node.ELEMENT_NODE) {
                        String name = child.getNodeName();
                        switch (name) {
                            case "entity-name":
                                jpb.addString("entityName", child.getTextContent());
                                break;
                            case "flow-name":
                                jpb.addString("flowName", child.getTextContent());
                                break;
                            case "flow-type":
                                jpb.addString("flowType", child.getTextContent());
                        }
                    }
                }
            }
        }
        return jpb.toJobParameters();
    }

    public JobExecution runMlcp(JsonNode json, JobStatusListener statusListener) {
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
