package com.marklogic.quickstart.service;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.apache.http.concurrent.BasicFuture;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.marklogic.contentpump.bean.MlcpBean;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.StatusListener;
import com.marklogic.hub.flow.AbstractFlow;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.util.FileUtil;
import com.marklogic.quickstart.util.SnooperOutputStream;

@Service
@Scope("session")
public class FlowManagerService {

    private static final String PROJECT_TMP_FOLDER = ".tmp";
    @Autowired
    private EnvironmentConfig envConfig;

    public FlowManager getFlowManager() {
        return new FlowManager(envConfig.getStagingClient());
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
            flows.add(flow);
        }

        return flows;
    }

    public Flow getServerFlow(String entityName, String flowName, FlowType flowType) {
        FlowManager flowManager = getFlowManager();
        return flowManager.getFlow(entityName, flowName, flowType);
    }

    public CancellableTask runFlow(Flow flow, int batchSize) {

        CancellableTask task = new CancellableTask() {

            private JobExecution jobExecution;

            @Override
            public void cancel(BasicFuture<?> resultFuture) {
                if (jobExecution != null) {
                    jobExecution.stop();
                }
            }

            @Override
            public void run(BasicFuture<?> resultFuture) {
                FlowManager flowManager = getFlowManager();
                this.jobExecution = flowManager.runFlow(flow, batchSize, new JobExecutionListener() {

                    @Override
                    public void beforeJob(JobExecution jobExecution) {}

                    @Override
                    public void afterJob(JobExecution jobExecution) {
                        ExitStatus status = jobExecution.getExitStatus();
                        if (ExitStatus.FAILED.getExitCode().equals(status.getExitCode())) {
                            List<Throwable> errors = jobExecution.getAllFailureExceptions();
                            if (errors.size() > 0) {
                                Throwable throwable = errors.get(0);
                                if (Exception.class.isInstance(throwable)) {
                                    resultFuture.failed((Exception) throwable);
                                }
                                else {
                                    resultFuture.failed(new Exception(errors.get(0)));
                                }
                            }
                            else {
                                resultFuture.failed(null);
                            }
                        }
                        else {
                            resultFuture.completed(null);
                        }
                    }
                });
            }
        };

        return task;
    }

    private Path getMlcpOptionsFilePath(Path destFolder, String entityName, String flowName) {
        return destFolder.resolve(entityName + "-" + flowName + ".txt");
    }

    public void saveOrUpdateFlowMlcpOptionsToFile(String entityName, String flowName, String mlcpOptionsFileContent) throws IOException {
        Path destFolder = Paths.get(envConfig.projectDir, PROJECT_TMP_FOLDER);
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
        Path destFolder = Paths.get(envConfig.projectDir, PROJECT_TMP_FOLDER);
        Path filePath = getMlcpOptionsFilePath(destFolder, entityName, flowName);
        File file = filePath.toFile();
        if(file.exists()) {
            return Files.toString(file, Charsets.UTF_8);
        }
        return "{ \"input_file_path\": \"" + envConfig.projectDir + "\" }";
    }

    public CancellableTask runMlcp(JsonNode json, StatusListener listener) throws IOException {
        CancellableTask task = new CancellableTask() {

            @Override
            public void cancel(BasicFuture<?> resultFuture) {
                // TODO: stop MLCP. We don't have a way to do this yet.
            }

            @Override
            public void run(BasicFuture<?> resultFuture) {
                try {
                    MlcpBean bean = new ObjectMapper().readerFor(MlcpBean.class).readValue(json);
                    bean.setHost(envConfig.mlSettings.host);
                    bean.setPort(envConfig.mlSettings.stagingPort);

                    // Assume that the HTTP credentials will work for mlcp
                    bean.setUsername(envConfig.mlSettings.adminUsername);
                    bean.setPassword(envConfig.mlSettings.adminPassword);

                    File file = new File(json.get("input_file_path").asText());
                    String canonicalPath = file.getCanonicalPath();
                    bean.setInput_file_path(canonicalPath);

                    bean.setOutput_uri_replace("\"" + canonicalPath.replace("\\", "\\\\") + ", ''\"");

                    PrintStream sysout = System.out;
                    SnooperOutputStream sos = new SnooperOutputStream(listener, sysout);
                    PrintStream ps = new PrintStream(sos);
                    System.setOut(ps);

                    bean.run();

                    System.out.flush();
                    System.setOut(sysout);
                    resultFuture.completed(null);
                }

                catch (IOException e) {
                    resultFuture.failed(e);
                }
            }
        };
        return task;
    }
}
