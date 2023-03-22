/*
 * Copyright (c) 2021 MarkLogic Corporation
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
package com.marklogic.hub.mlcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.contentpump.bean.MlcpBean;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.impl.HubConfigImpl;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.SystemUtils;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class MlcpRunner extends ProcessRunner {

    private final JsonNode mlcpOptions;
    private MlcpBean mlcpBean;
    private final String jobId = UUID.randomUUID().toString();
    private final AtomicLong successfulEvents = new AtomicLong(0);
    private final AtomicLong failedEvents = new AtomicLong(0);
    private final DatabaseClient databaseClient;
    private String database = null;

    private Boolean isHostLoadBalancer;
    private final String username;
    private final String password;

    /**
     * To support running parallel tests, this stores whether
     * a load balancer is being used or not. That avoids having to access the HubConfig on a separate thread, which is
     * not possible when running parallel tests.
     *
     * @param hubConfig
     * @param mlcpOptions
     */
    public MlcpRunner(HubConfigImpl hubConfig, JsonNode mlcpOptions) {
        this(hubConfig, null, mlcpOptions);
    }

    public MlcpRunner(HubConfigImpl hubConfig, MlcpBean mlcpBean) {
        this(hubConfig, null, null);
        this.mlcpBean = mlcpBean;
        mlcpBean.setCommand("IMPORT");
        mlcpBean.setHost(hubConfig.getHost());
        if (mlcpBean.getPort() == null) {
            mlcpBean.setPort(hubConfig.getPort(DatabaseKind.STAGING));
        }
        mlcpBean.setUsername(hubConfig.getMlUsername());
        mlcpBean.setPassword(hubConfig.getMlPassword());
    }

    public MlcpRunner(HubConfigImpl hubConfig, DatabaseClient databaseClient, JsonNode mlcpOptions) {
        super();

        this.mlcpOptions = mlcpOptions;
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

    public String runAndReturnOutput() {
        this.start();
        try {
            this.join();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        return getProcessOutput();
    }

    @Override
    public void run() {
        try {
            MlcpBean bean = this.mlcpBean != null ? this.mlcpBean : makeMlcpBean();
            if (this.isHostLoadBalancer) {
                bean.setRestrict_hosts(true);
            }
            buildCommand(bean);
            super.run();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String buildLoggerconfig() {
        return "<Configuration status=\"WARN\">\n" +
                "    <Appenders>\n" +
                "        <!-- Console appender configuration -->\n" +
                "        <Console name=\"Console\" target=\"SYSTEM_OUT\">\n" +
                "            <PatternLayout pattern=\"%d{yy/MM/dd HH:mm:ss} %p %c{2}: %m%n\"/>\n" +
                "        </Console>\n" +
                "    </Appenders>\n" +
                "    <Loggers>\n" +
                "        <!-- Root logger configuration -->\n" +
                "        <Root level=\"INFO\">\n" +
                "            <AppenderRef ref=\"Console\"/>\n" +
                "        </Root>\n" +
                "        <!-- To enable debug for mapreduce -->\n" +
                "        <!--\n" +
                "        <Logger name=\"com.marklogic.mapreduce\" level=\"DEBUG\" additivity=\"false\">\n" +
                "            <AppenderRef ref=\"Console\"/>\n" +
                "        </Logger>\n" +
                "        -->\n" +
                "        <!-- To enable debug for contentpump -->\n" +
                "        <!--\n" +
                "        <Logger name=\"com.marklogic.contentpump\" level=\"DEBUG\" additivity=\"false\">\n" +
                "            <AppenderRef ref=\"Console\"/>\n" +
                "        </Logger>\n" +
                "        -->\n" +
                "        <!-- To enable debug for tree -->\n" +
                "        <!--\n" +
                "        <Logger name=\"com.marklogic.tree\" level=\"TRACE\" additivity=\"false\">\n" +
                "            <AppenderRef ref=\"Console\"/>\n" +
                "        </Logger>\n" +
                "        -->\n" +
                "        <!-- To supress not native warn on Mac and Solaris -->\n" +
                "        <Logger name=\"org.apache.hadoop.util.NativeCodeLoader\" level=\"ERROR\" additivity=\"false\">\n" +
                "            <AppenderRef ref=\"Console\"/>\n" +
                "        </Logger>\n" +
                "        <Logger name=\"org.apache.hadoop.ipc.Client\" level=\"ERROR\" additivity=\"false\">\n" +
                "            <AppenderRef ref=\"Console\"/>\n" +
                "        </Logger>\n" +
                "    </Loggers>\n" +
                "</Configuration>\n";
    }

    private MlcpBean makeMlcpBean() throws Exception {
        MlcpBean bean = new ObjectMapper().readerFor(MlcpBean.class).readValue(mlcpOptions);
        if (databaseClient != null) {
            bean.setHost(databaseClient.getHost());
            bean.setPort(databaseClient.getPort());
        }
        if (database != null) {
            bean.setDatabase(database);
        }

        if (!"copy".equalsIgnoreCase(bean.getCommand())) {
            // Assume that the HTTP credentials will work for mlcp
            bean.setUsername(this.username);
            bean.setPassword(this.password);
        }

        if (mlcpOptions.has("input_file_path")) {
            File file = new File(mlcpOptions.get("input_file_path").asText());
            String canonicalPath = file.getCanonicalPath();
            bean.setInput_file_path(canonicalPath);
        }

        bean.setModules_root("/");
        return bean;
    }

    private void buildCommand(MlcpBean bean) throws IOException {
        ArrayList<String> args = new ArrayList<>();
        // avoid escaping issues in Windows by using an options file to hold the transform_param
        if (SystemUtils.IS_OS_WINDOWS_10) {
            String transformParam = bean.getTransform_param();
            if (transformParam != null) {
                Path tempFilePath = Files.createTempFile("mlcp", ".options");
                try (FileWriter fw = new FileWriter(tempFilePath.toFile())) {
                    fw.write("-transform_param\n");
                    fw.write(transformParam);
                    fw.flush();
                }
                bean.setTransform_param(null);
                bean.setOptions_file(tempFilePath.toAbsolutePath().toString());
            }
        }
        String javaHome = System.getProperty("java.home");
        String javaBin = javaHome +
            File.separator + "bin" +
            File.separator + "java";
        String classpath = System.getProperty("java.class.path");
        File loggerFile = File.createTempFile("mlcp-", "-logger.xml");
        FileUtils.writeStringToFile(loggerFile, buildLoggerconfig());
        Map<String, String> environment = new HashMap<>();
        environment.put("CLASSPATH", classpath);
        this.withEnvironment(environment);
        args.add(javaBin);
        args.add("-Dlog4j2.configurationFile=" + loggerFile.toURI());
        if (classpath.endsWith(".war")) {
            args.add("-jar");
            args.add("mlcp");
        } else {
            args.add("com.marklogic.contentpump.ContentPump");
        }
        args.addAll(Arrays.asList(bean.buildArgs()));

        this.withArgs(args);

        this.withStreamConsumer(new MlcpConsumer(successfulEvents, failedEvents, jobId));
    }

    /**
     * Set the database context for the MlCP Client
     *
     * @param database the database name to use
     */
    public void setDatabase(String database) {
        this.database = database;
    }
}
