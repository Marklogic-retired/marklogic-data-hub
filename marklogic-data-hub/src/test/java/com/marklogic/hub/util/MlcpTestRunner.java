package com.marklogic.hub.util;

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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.contentpump.bean.MlcpBean;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowStatusListener;
import com.marklogic.hub.job.JobManager;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class MlcpTestRunner extends ProcessRunner {

    private JobManager jobManager;
    private Flow flow;
    private JsonNode mlcpOptions;
    private String jobId = UUID.randomUUID().toString();
    private AtomicLong successfulEvents = new AtomicLong(0);
    private AtomicLong failedEvents = new AtomicLong(0);
    FlowStatusListener flowStatusListener;

    public MlcpTestRunner(HubConfig hubConfig, Flow flow, JsonNode mlcpOptions, FlowStatusListener statusListener) {
        super();

        this.withHubconfig(hubConfig);

        this.jobManager = new JobManager(hubConfig.newJobDbClient());
        this.flowStatusListener = statusListener;
        this.flow = flow;
        this.mlcpOptions = mlcpOptions;
    }

    @Override
    public void run() {
        HubConfig hubConfig = getHubConfig();

        try {
            MlcpBean bean = new ObjectMapper().readerFor(MlcpBean.class).readValue(mlcpOptions);
            bean.setHost(hubConfig.host);
            bean.setPort(hubConfig.stagingPort);

            // Assume that the HTTP credentials will work for mlcp
            bean.setUsername(hubConfig.getUsername());
            bean.setPassword(hubConfig.getPassword());

            File file = new File(mlcpOptions.get("input_file_path").asText());
            String canonicalPath = file.getCanonicalPath();
            bean.setInput_file_path(canonicalPath);
            bean.setTransform_param("\"" + bean.getTransform_param().replaceAll("\"", "") + ",jobId=" + jobId + "\"");

            buildCommand(bean);

            super.run();

            flowStatusListener.onStatusChange(jobId, 100, "");

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String buildLoggerconfig() {
        return "<configuration>\n" +
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
    }

    private void buildCommand(MlcpBean bean) throws IOException, InterruptedException {
        String javaHome = System.getProperty("java.home");
        String javaBin = javaHome +
            File.separator + "bin" +
            File.separator + "java";
        String classpath = System.getProperty("java.class.path");

        File loggerFile = File.createTempFile("mlcp-", "-logger.xml");
        FileUtils.writeStringToFile(loggerFile, buildLoggerconfig());

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
            args.add("com.marklogic.hub.util.MlcpMain");
        }

        List<String> cmdArgs = new ArrayList<>();
        for (String arg : bean.buildArgs()) {
            cmdArgs.add(arg);
        }
        int idx = cmdArgs.indexOf("-transform_module");
        if (idx >= 0) {
            cmdArgs.add(idx + 2, getHubConfig().modulesDbName);
            cmdArgs.add(idx + 2, "-modules");
        }
        args.addAll(cmdArgs);

        this.withArgs(args);

        this.withStreamConsumer(new MlcpConsumer(successfulEvents,
            failedEvents, flowStatusListener, jobId));
    }
}
