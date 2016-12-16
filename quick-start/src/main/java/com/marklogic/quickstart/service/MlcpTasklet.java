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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.contentpump.bean.MlcpBean;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.JobStatusListener;
import com.marklogic.quickstart.util.StreamGobbler;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private HubConfig hubConfig;
    private JsonNode mlcpOptions;
    private JobStatusListener statusListener;
    private ArrayList<String> mlcpOutput = new ArrayList<>();
    private boolean hasError = false;

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

        File loggerFile = File.createTempFile("mlcp-", "-logger.xml");
        String loggerData = "<configuration>\n" +
            "\n" +
            "  <appender name=\"STDOUT\" class=\"ch.qos.logback.core.ConsoleAppender\">\n" +
            "    <!-- encoders are assigned the type\n" +
            "         ch.qos.logback.classic.encoder.PatternLayoutEncoder by default -->\n" +
            "    <encoder>\n" +
            "      <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>\n" +
            "    </encoder>\n" +
            "  </appender>\n" +
            "\n" +
            "  <logger name=\"org.apache.http\" level=\"WARN\"/>\n" +
            "\n" +
            "  <logger name=\"com.marklogic.spring.batch.core.repository.dao.MarkLogicStepExecutionDao\" level=\"WARN\"/>\n" +
            "  <logger name=\"com.marklogic.spring.batch.core.repository.dao.MarkLogicJobExecutionDao\" level=\"WARN\"/>\n" +
            "  <logger name=\"com.marklogic.client.impl.DocumentManagerImpl\" level=\"WARN\"/>\n" +
            "  <logger name=\"com.marklogic.client.impl.DatabaseClientImpl\" level=\"WARN\"/>\n" +
            "  <logger name=\"com.marklogic\" level=\"INFO\"/>\n" +
            "  <logger name=\"com.marklogic.appdeployer\" level=\"INFO\"/>\n" +
            "  <logger name=\"com.marklogic.hub\" level=\"INFO\"/>\n" +
            "  <logger name=\"com.marklogic.contentpump\" level=\"INFO\"/>\n" +
            "  <logger name=\"org.apache.catalina.webresources.Cache\" level=\"ERROR\"/>\n" +
            "  <logger name=\"org.apache.hadoop.util.Shell\" level=\"OFF\"/>\n" +
            "  <logger name=\"org.apache.hadoop.util.NativeCodeLoader\" level=\"ERROR\"/>\n" +
            "\n" +
            "  <root level=\"WARN\">\n" +
            "    <appender-ref ref=\"STDOUT\" />\n" +
            "  </root>\n" +
            "</configuration>\n";
        FileUtils.writeStringToFile(loggerFile, loggerData);

        ArrayList<String> args = new ArrayList<>();
        args.add(javaBin);
        args.add("-Dlogback.configurationFile=" + loggerFile.toURI());

        if (classpath.endsWith(".war")) {
            args.add("-jar");
            args.add(classpath);
        }
        else {
            args.add("-cp");
            args.add(classpath);
            args.add("com.marklogic.quickstart.Application");
        }
        args.add("mlcp");
        args.addAll(Arrays.asList(bean.buildArgs()));

        logger.debug(String.join(" ", args));
        ProcessBuilder pb = new ProcessBuilder(args);
        Process process = pb.start();

        StreamGobbler gobbler = new StreamGobbler(process.getInputStream(), new Consumer<String>() {
            private int currentPc = 0;

            @Override
            public void accept(String status) {
                System.out.println(status);
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
                } catch (NumberFormatException e) {
                }

                mlcpOutput.add(status);
                statusListener.onStatusChange(jobId, currentPc, status);
            }
        });
        gobbler.start();
        process.waitFor();
        gobbler.join();
    }
}
