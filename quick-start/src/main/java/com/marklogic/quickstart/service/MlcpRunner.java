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
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowStatusListener;
import com.marklogic.hub.job.Job;
import com.marklogic.hub.job.JobManager;
import com.marklogic.quickstart.util.StreamGobbler;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class MlcpRunner extends Thread {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private HubConfig hubConfig;
    private JsonNode mlcpOptions;
    private FlowStatusListener statusListener;
    private ArrayList<String> mlcpOutput = new ArrayList<>();
    private String jobId = UUID.randomUUID().toString();
    private JobManager jobManager;
    private Flow flow;
    private AtomicLong successfulEvents = new AtomicLong(0);
    private AtomicLong failedEvents = new AtomicLong(0);

    MlcpRunner(HubConfig hubConfig, Flow flow, JsonNode mlcpOptions, FlowStatusListener statusListener) {
        super();

        this.hubConfig = hubConfig;
        this.mlcpOptions = mlcpOptions;
        this.statusListener = statusListener;
        this.jobManager = new JobManager(this.hubConfig.newJobDbClient());
        this.flow = flow;
    }

    @Override
    public void run() {
        try {
            MlcpBean bean = new ObjectMapper().readerFor(MlcpBean.class).readValue(mlcpOptions);
            bean.setHost(hubConfig.host);
            bean.setPort(hubConfig.stagingPort);

            Job job = Job.withFlow(flow)
                .withJobId(jobId);
            jobManager.saveJob(job);

            // Assume that the HTTP credentials will work for mlcp
            bean.setUsername(hubConfig.getUsername());
            bean.setPassword(hubConfig.getPassword());

            File file = new File(mlcpOptions.get("input_file_path").asText());
            String canonicalPath = file.getCanonicalPath();
            bean.setInput_file_path(canonicalPath);

            bean.setTransform_param("\"" + bean.getTransform_param().replaceAll("\"", "") + ",jobId=" + jobId + "\"");

            runMlcp(bean);

            statusListener.onStatusChange(jobId, 100, "");

            // store the thing in MarkLogic
            job.withJobOutput(String.join("\n", mlcpOutput))
                .setCounts(successfulEvents.get(), failedEvents.get(), 0, 0)
                .withEndTime(new Date());
            jobManager.saveJob(job);

	    //Create MLCP .done file
            try
            {
                String sDoneFilename = mlcpOptions.get("output_collections").asText();
                sDoneFilename = sDoneFilename.substring(sDoneFilename.lastIndexOf(',') + 1).replaceAll("\"","");
                if(!sDoneFilename.equals(""))
                {
                    sDoneFilename = mlcpOptions.get("input_file_path").asText() + File.separator + sDoneFilename + ".done";
                    Files.write(Paths.get(sDoneFilename),(""+System.currentTimeMillis()).getBytes());
                }
            }
            catch(Exception e){logger.debug(e.getMessage());}

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void runMlcp(MlcpBean bean) throws IOException, InterruptedException {
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
            private final Pattern completedPattern = Pattern.compile("^.+completed (\\d+)%$");
            private final Pattern successfulEventsPattern = Pattern.compile("^.+OUTPUT_RECORDS_COMMITTED:\\s+(\\d+).*$");
            private final Pattern failedEventsPattern = Pattern.compile("^.+OUTPUT_RECORDS_FAILED\\s+(\\d+).*$");

            @Override
            public void accept(String status) {
                Matcher m = completedPattern.matcher(status);
                if (m.matches()) {
                    int pc = Integer.parseInt(m.group(1));

                    // don't send 100% because more stuff happens after 100% is reported here
                    if (pc > currentPc && pc != 100) {
                        currentPc = pc;
                    }
                }

                m = successfulEventsPattern.matcher(status);
                if (m.matches()) {
                    successfulEvents.addAndGet(Long.parseLong(m.group(1)));
                }

                m = failedEventsPattern.matcher(status);
                if (m.matches()) {
                    failedEvents.addAndGet(Long.parseLong(m.group(1)));
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
