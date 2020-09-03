/*
 * Copyright (c) 2020 MarkLogic Corporation
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
package com.marklogic.hub.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.contentpump.bean.MlcpBean;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.legacy.flow.LegacyFlow;
import com.marklogic.hub.legacy.flow.LegacyFlowStatusListener;
import com.marklogic.hub.legacy.job.Job;
import com.marklogic.hub.legacy.job.JobStatus;
import com.marklogic.hub.legacy.job.LegacyJobManager;
import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

public class MlcpRunner extends ProcessRunner {

    private LegacyJobManager jobManager;
    private LegacyFlow flow;
    private JsonNode mlcpOptions;
    private String jobId = UUID.randomUUID().toString();
    private AtomicLong successfulEvents = new AtomicLong(0);
    private AtomicLong failedEvents = new AtomicLong(0);
    LegacyFlowStatusListener flowStatusListener;
    private String mlcpPath;
    private String mainClass;
    private DatabaseClient databaseClient;
    private String database = null;

    private Boolean isHostLoadBalancer;
    private String username;
    private String password;

    /**
     * This constructor is currently only used for testing. And to support running parallel tests, this stores whether
     * a load balancer is being used or not. That avoids having to access the HubConfig on a separate thread, which is
     * not possible when running parallel tests.
     *
     * @param mainClass
     * @param hubConfig
     * @param mlcpOptions
     */
    public MlcpRunner(String mainClass, HubConfig hubConfig, JsonNode mlcpOptions) {
        this(null, mainClass, hubConfig, null, null, mlcpOptions, null);
    }

    public MlcpRunner(String mlcpPath, String mainClass, HubConfig hubConfig, LegacyFlow flow, DatabaseClient databaseClient, JsonNode mlcpOptions, LegacyFlowStatusListener statusListener) {
        super();

        this.jobManager = LegacyJobManager.create(hubConfig.newJobDbClient());
        this.flowStatusListener = statusListener;
        this.flow = flow;
        this.mlcpOptions = mlcpOptions;
        this.mlcpPath = mlcpPath;
        this.mainClass = mainClass;
        this.databaseClient = databaseClient;

        // Grab the needed data from HubConfig no reference to it needs to be held
        // This allows for running tests on this class in parallel
        this.isHostLoadBalancer = hubConfig.getIsHostLoadBalancer();
        if (this.isHostLoadBalancer == null) {
            this.isHostLoadBalancer = false;
        }
        this.username = hubConfig.getAppConfig().getAppServicesUsername();
        this.password = hubConfig.getAppConfig().getAppServicesPassword();
    }

    public String getJobId() {
        return jobId;
    }

    @Override
    public void run() {
        Job job = null;
        if (flow != null) {
            job = Job.withFlow(flow)
                    .withJobId(jobId);
            jobManager.saveJob(job);
        }

        try {
            MlcpBean bean = new ObjectMapper().readerFor(MlcpBean.class).readValue(mlcpOptions);
            if (databaseClient != null) {
                bean.setHost(databaseClient.getHost());
                bean.setPort(databaseClient.getPort());
            }
            if (database != null) {
                bean.setDatabase(database);
            }


            if (!"copy".equals(bean.getCommand().toLowerCase())) {
                // Assume that the HTTP credentials will work for mlcp
                bean.setUsername(this.username);
                bean.setPassword(this.password);
            }

            if (mlcpOptions.has("input_file_path")) {
                File file = new File(mlcpOptions.get("input_file_path").asText());
                String canonicalPath = file.getCanonicalPath();
                bean.setInput_file_path(canonicalPath);
            }

            if (job != null) {
                bean.setTransform_param("\"" + bean.getTransform_param() + ",job-id=" + jobId + "\"");
            }

            bean.setModules_root("/");

            if (this.isHostLoadBalancer) {
                bean.setRestrict_hosts(true);
            }

            buildCommand(bean);

            super.run();

            if (flowStatusListener != null) {
                flowStatusListener.onStatusChange(jobId, 100, "");
            }

        } catch (Exception e) {
            if (job != null) {
                job.withStatus(JobStatus.FAILED)
                        .withEndTime(new Date());
                jobManager.saveJob(job);
            }
            throw new RuntimeException(e);
        } finally {
            if (job != null) {
                JobStatus status;
                if (failedEvents.get() > 0 && successfulEvents.get() > 0) {
                    status = JobStatus.FINISHED_WITH_ERRORS;
                } else if (failedEvents.get() == 0 && successfulEvents.get() > 0) {
                    status = JobStatus.FINISHED;
                } else {
                    status = JobStatus.FAILED;
                }

                // store the thing in MarkLogic
                job.withJobOutput(getProcessOutput())
                        .withStatus(status)
                        .setCounts(successfulEvents.get(), failedEvents.get(), 0, 0)
                        .withEndTime(new Date());
                jobManager.saveJob(job);
            }
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
            "  <logger name=\"com.marklogic.hub\" level=\"DEBUG\"/>\n" +
            "  <logger name=\"com.marklogic.contentpump\" level=\"DEBUG\"/>\n" +
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
        ArrayList<String> args = new ArrayList<>();
        if (this.mlcpPath != null && this.mlcpPath.length() > 0) {
            File mlcpFile = new File(this.mlcpPath);
            if (!mlcpFile.exists()) {
                throw new RuntimeException("MLCP does not exist at: " + mlcpPath);
            }
            else if (!mlcpFile.canExecute()) {
                throw new RuntimeException("Cannot execute: " + mlcpPath);
            }
            args.add(this.mlcpPath);
        }
        else {
            String javaHome = System.getProperty("java.home");
            String javaBin = javaHome +
                File.separator + "bin" +
                File.separator + "java";
            String classpath = System.getProperty("java.class.path");

            //logger.warn("Classpath before is: " + classpath);
            // strip out non-essential entries to truncate classpath
            List<String> classpathEntries = Arrays.asList(classpath.split(File.pathSeparator));
            String filteredClasspathEntries = classpath;
            int MAX_CLASSPATH_LENGTH = 10000;
            // if classpath was not alrady shortened (say, by IDE) then strip to run mlcp
            if (filteredClasspathEntries.length() > MAX_CLASSPATH_LENGTH)
                filteredClasspathEntries = classpathEntries
                            .stream()
                            .filter(
                                u -> (
                                    u.contains(System.getProperty("user.dir")) ||
                                    u.contains("jdk") ||
                                    u.contains("jre") ||
                                    u.contains("log") ||
                                    u.contains("xml") ||
                                    u.contains("json") ||
                                    u.contains("jackson") ||
                                    u.contains("xerces") ||
                                    u.contains("slf") ||
                                    u.contains("mlcp") ||
                                    u.contains("xcc") ||
                                    u.contains("xpp") ||
                                    u.contains("protobuf") ||
                                    u.contains("mapreduce") ||
                                    u.contains("guava") ||
                                    u.contains("apache") ||
                                    u.contains("commons") ||
                                    u.contains("hadoop") ||
                                    u.contains("thoughtworks"))
                            ).collect(Collectors.joining(File.pathSeparator));

            //logger.warn("Classpath filtered to: " + filteredClasspathEntries);

            File loggerFile = File.createTempFile("mlcp-", "-logger.xml");
            FileUtils.writeStringToFile(loggerFile, buildLoggerconfig());

            args.add(javaBin);
            args.add("-Dlogback.configurationFile=" + loggerFile.toURI());
            if (classpath.endsWith(".war")) {
                args.add("-jar");
                args.add(classpath);
                args.add("mlcp");
            }
            else {
                args.add("-cp");
                args.add(filteredClasspathEntries);
                args.add(mainClass);
            }
        }

        args.addAll(Arrays.asList(bean.buildArgs()));

        this.withArgs(args);

        this.withStreamConsumer(new MlcpConsumer(successfulEvents,
            failedEvents, flowStatusListener, jobId));
    }

    /**
     * Set the database context for the MlCP Client
     * @param database the database name to use
     */
    public void setDatabase(String database) {
        this.database = database;
    }
}
