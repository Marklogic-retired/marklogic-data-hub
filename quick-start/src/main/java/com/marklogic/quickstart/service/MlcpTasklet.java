package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.contentpump.ContentPump;
import com.marklogic.contentpump.bean.MlcpBean;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.JobStatusListener;
import com.marklogic.quickstart.util.StreamGobbler;
import org.apache.commons.io.FileUtils;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.function.Consumer;

class MlcpTasklet implements Tasklet {

    private HubConfig hubConfig;
    private JsonNode mlcpOptions;
    private JobStatusListener statusListener;
    private ArrayList<String> mlcpOutput = new ArrayList<>();
    private boolean hasError = false;
    private StreamGobbler gobbler;

    MlcpTasklet(HubConfig hubConfig, JsonNode mlcpOptions, JobStatusListener statusListener) {
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
        String canonicalPath = file.getCanonicalPath();
        bean.setInput_file_path(canonicalPath);

        runMlcp(jobId, bean);

        chunkContext
            .getStepContext()
            .getStepExecution()
            .getJobExecution()
            .getExecutionContext().put("jobOutput", String.join("\n", mlcpOutput));

        statusListener.onStatusChange(jobId, 100, "");

        if (hasError) {
            throw new Exception("Error in Mlcp Execution");
        }
        return RepeatStatus.FINISHED;
    }

    private void runMlcp(long jobId, MlcpBean bean) throws IOException, InterruptedException {
        String javaHome = System.getProperty("java.home");
        String javaBin = javaHome +
            File.separator + "bin" +
            File.separator + "java";
        String classpath = System.getProperty("java.class.path");
        String className = ContentPump.class.getCanonicalName();

        File loggerFile = File.createTempFile("mlcp-", "-logger");
        String loggerData = "log4j.rootLogger=INFO,console\n" +
            "log4j.appender.console=org.apache.log4j.ConsoleAppender\n" +
            "log4j.appender.console.target=System.err\n" +
            "log4j.appender.console.layout=org.apache.log4j.PatternLayout\n" +
            "log4j.appender.console.layout.ConversionPattern=%d{yy/MM/dd HH:mm:ss} %p %c{2}: %m%n\n" +
            "\n" +
            "# To suppress not native warn on Mac and Solaris\n" +
            "log4j.logger.org.apache.hadoop.util.NativeCodeLoader=ERROR\n" +
            "\n" +
            "# To enable debug\n" +
            "#log4j.logger.com.marklogic.mapreduce=DEBUG\n" +
            "#log4j.logger.com.marklogic.contentpump=DEBUG\n";
        FileUtils.writeStringToFile(loggerFile, loggerData);

        ArrayList<String> args = new ArrayList<>();
        args.add(javaBin);
        args.add("-Dlog4j.configurationFile=" + loggerFile.getAbsolutePath());
        args.add("-cp");
        args.add(classpath);
        args.add(className);
        args.addAll(Arrays.asList(bean.buildArgs()));

        ProcessBuilder pb = new ProcessBuilder(args);
        Process process = pb.start();

        gobbler = new StreamGobbler(process.getInputStream(), new Consumer<String>() {
            private int currentPc = 0;

            @Override
            public void accept(String status) {

                // don't log an error if the winutils binary is missing
                if (status.contains("ERROR") && !status.contains("winutils binary")) {
                    hasError = true;
                }

                try {
                    int pc = Integer.parseInt(status.replaceFirst(".*completed (\\d+)%", "$1"));

                    // don't send 100% because more stuff happens after 100% is reported here
                    if (pc > currentPc && pc != 100) {
                        currentPc = pc;
                    }
                }
                catch (NumberFormatException e) {}

                mlcpOutput.add(status);
                statusListener.onStatusChange(jobId, currentPc, status);
            }
        });
        gobbler.start();
        process.waitFor();
        gobbler.join();
    }
}
