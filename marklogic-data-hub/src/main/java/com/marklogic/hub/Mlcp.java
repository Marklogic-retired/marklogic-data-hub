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
package com.marklogic.hub;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Mlcp {
    private static final Logger LOGGER = LoggerFactory.getLogger(Mlcp.class);

    private final static String DEFAULT_HADOOP_HOME_DIR= "./hadoop/";

    private List<MlcpSource> sources = new ArrayList<>();

    private String host;

    private int port;

    private String user;

    private String password;

    public Mlcp(String host, int port, String user, String password) throws IOException {
        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;

        setHadoopHomeDir();
    }

    public void addSourceDirectory(String directoryPath, SourceOptions options) {
        MlcpSource source = new MlcpSource(directoryPath, options);
        sources.add(source);
    }

    public void loadContent() throws IOException {
        for (MlcpSource source : sources) {
            try {
                List<String> arguments = new ArrayList<>();

                arguments.add("import");
                arguments.add("-mode");
                arguments.add("local");
                arguments.add("-host");
                arguments.add(host);
                arguments.add("-port");
                arguments.add(Integer.toString(port));
                arguments.add("-username");
                arguments.add(user);
                arguments.add("-password");
                arguments.add(password);

                // add arguments related to the source
                List<String> sourceArguments = source.getMlcpArguments();
                arguments.addAll(sourceArguments);

                DataHubContentPump contentPump = new DataHubContentPump(arguments);
                contentPump.execute();
            } catch (IOException e) {
                throw new IOException("Cannot load data from: " + source.getSourcePath() + " due to: " + e.getMessage());
            }
        }
    }

    protected void setHadoopHomeDir() throws IOException {
        String home = System.getProperty("hadoop.home.dir");
        if (home == null) {
            home = DEFAULT_HADOOP_HOME_DIR;
        }
        System.setProperty("hadoop.home.dir", new File(home).getCanonicalPath());
    }

    private static class MlcpSource {
        private String sourcePath;
        private SourceOptions sourceOptions;

        public MlcpSource(String sourcePath, SourceOptions sourceOptions) {
            this.sourcePath = sourcePath;
            this.sourceOptions = sourceOptions;
        }

        public String getSourcePath() {
            return sourcePath;
        }

        public List<String> getMlcpArguments() throws IOException {
            File file = new File(sourcePath);
            String canonicalPath = file.getCanonicalPath();

            List<String> arguments = new ArrayList<>();
            arguments.add("-input_file_path");
            arguments.add(canonicalPath);
            arguments.add("-input_file_type");
            if (sourceOptions.getInputFileType() == null) {
                arguments.add("documents");
            }
            else {
                arguments.add(sourceOptions.getInputFileType());
            }

            if (sourceOptions.getInputFilePattern() != null) {
                arguments.add("-input_file_pattern");
                arguments.add(sourceOptions.getInputFilePattern());
            }

            String collections = this.getOutputCollections();
            arguments.add("-output_collections");
            arguments.add("\"" + collections + "\"");

            if (sourceOptions.getInputCompressed()) {
                arguments.add("-input_compressed");
            }

            // by default, cut the source directory path to make URIs shorter
            String uriReplace = canonicalPath + ",''";
            uriReplace = uriReplace.replaceAll("\\\\", "/");

            arguments.add("-output_uri_replace");
            arguments.add("\"" + uriReplace + "\"");

            arguments.add("-transform_module");
            arguments.add("/com.marklogic.hub/mlcp-flow-transform.xqy");
            arguments.add("-transform_namespace");
            arguments.add("http://marklogic.com/data-hub/mlcp-flow-transform");
            arguments.add("-transform_param");
            arguments.add("\"" + sourceOptions.getTransformParams() + "\"");
            return arguments;
        }

        private String getOutputCollections() {
            StringBuilder collectionsBuilder = new StringBuilder();
            collectionsBuilder.append(sourceOptions.getEntityName());
            collectionsBuilder.append(",");
            collectionsBuilder.append(sourceOptions.getFlowName());
            collectionsBuilder.append(",");
            collectionsBuilder.append(sourceOptions.getFlowType());
            if(sourceOptions.getCollection() != null) {
                collectionsBuilder.append(",");
                collectionsBuilder.append(sourceOptions.getCollection());
            }
            return collectionsBuilder.toString();
        }
    }

    public static class SourceOptions {
        private String entityName;
        private String flowName;
        private String flowType;
        private String inputFileType;
        private String inputFilePattern;
        private String collection;
        private boolean inputCompressed = false;

        public SourceOptions(String entityName, String flowName, String flowType) {
            this.entityName = entityName;
            this.flowName = flowName;
            this.flowType = flowType;
        }

        public String getEntityName() {
            return entityName;
        }

        public String getFlowName() {
            return flowName;
        }

        public String getFlowType() {
            return flowType;
        }

        public String getInputFileType() {
            return inputFileType;
        }

        public void setInputFileType(String inputFileType) {
            this.inputFileType = inputFileType;
        }

        public String getInputFilePattern() {
            return inputFilePattern;
        }

        public void setInputFilePattern(String inputFilePattern) {
            this.inputFilePattern = inputFilePattern;
        }

        public String getCollection() {
            return collection;
        }

        public void setCollection(String collection) {
            this.collection = collection;
        }

        public void setInputCompressed(boolean inputCompressed) {
            this.inputCompressed = inputCompressed;
        }

        public boolean getInputCompressed() {
            return this.inputCompressed;
        }

        protected String getTransformParams() {
            return String
                    .format("<params><entity-name>%s</entity-name><flow-name>%s</flow-name><flow-type>%s</flow-type></params>",
                            entityName, flowName, flowType);
        }
    }
}
