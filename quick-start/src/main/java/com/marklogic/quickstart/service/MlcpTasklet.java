package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.contentpump.bean.MlcpBean;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.JobStatusListener;
import com.marklogic.hub.StatusListener;
import com.marklogic.quickstart.util.MlcpOutputStreamInterceptor;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;

import java.io.File;
import java.io.PrintStream;
import java.util.ArrayList;

public class MlcpTasklet implements Tasklet {

    private HubConfig hubConfig;
    private JsonNode mlcpOptions;
    private JobStatusListener statusListener;
    private ArrayList<String> mlcpOutput = new ArrayList<>();

    public MlcpTasklet(HubConfig hubConfig, JsonNode mlcpOptions, JobStatusListener statusListener) {
        this.hubConfig = hubConfig;
        this.mlcpOptions = mlcpOptions;
        this.statusListener = statusListener;
    }

    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext ) throws Exception {

        long jobId = chunkContext.getStepContext().getStepExecution().getJobExecution().getJobId();
        MlcpBean bean = new ObjectMapper().readerFor(MlcpBean.class).readValue(mlcpOptions);
        bean.setHost(hubConfig.host);
        bean.setPort(hubConfig.stagingPort);

        // Assume that the HTTP credentials will work for mlcp
        bean.setUsername(hubConfig.username);
        bean.setPassword(hubConfig.password);

        File file = new File(mlcpOptions.get("input_file_path").asText());

        PrintStream sysout = System.out;
        MlcpOutputStreamInterceptor sos = new MlcpOutputStreamInterceptor(new StatusListener() {
            @Override
            public void onStatusChange(int percentComplete, String message) {
                mlcpOutput.add(message);
                statusListener.onStatusChange(jobId, percentComplete, message);
            }
        }, sysout);
        PrintStream ps = new PrintStream(sos);
        System.setOut(ps);


        bean.run();

        chunkContext
            .getStepContext()
            .getStepExecution()
            .getJobExecution()
            .getExecutionContext().put("jobOutput", String.join("\n", mlcpOutput));

        System.out.flush();
        System.setOut(sysout);
        statusListener.onStatusChange(jobId, 100, "");

        return RepeatStatus.FINISHED;
    }
}
